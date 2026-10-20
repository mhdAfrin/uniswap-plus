const express = require("express");
const { Listing, Request } = require("../models/models");
const { protect } = require("../middleware/middleware");
const { rankMatches } = require("../utils/matcher");

const router = express.Router();

// @route   GET /api/listings?type=&category=&q=&tags=&sortBy=
router.get("/", async (req, res, next) => {
  try {
    const { type, category, q, tags, sortBy } = req.query;
    const filter = { status: "active" };

    if (type) filter.type = type;
    if (category) filter.category = { $regex: category, $options: "i" };
    if (tags) filter.tags = { $in: tags.split(",").map((t) => t.trim().toLowerCase()) };
    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { tags: { $regex: q, $options: "i" } },
      ];
    }

    // Determine sorting criteria based on query parameter
    let sortOrder = { createdAt: -1 }; // default to newest first
    if (sortBy === "oldest") {
      sortOrder = { createdAt: 1 };
    } else if (sortBy === "price_asc") {
      sortOrder = { price: 1, createdAt: -1 };
    } else if (sortBy === "price_desc") {
      sortOrder = { price: -1, createdAt: -1 };
    } else if (sortBy === "title_asc") {
      sortOrder = { title: 1 };
    } else if (sortBy === "title_desc") {
      sortOrder = { title: -1 };
    }

    const listings = await Listing.find(filter)
      .populate("owner", "name avatarColor ratingAverage department")
      .sort(sortOrder)
      .limit(100);

    res.json({ listings });
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/listings/mine
router.get("/mine", protect, async (req, res, next) => {
  try {
    const listings = await Listing.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.json({ listings });
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/listings/:id/matches -> open requests that best match this listing
router.get("/:id/matches", async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: "Listing not found" });

    const candidateRequests = await Request.find({ status: "open" }).populate(
      "owner",
      "name avatarColor"
    );

    const ranked = rankMatches(listing, candidateRequests).slice(0, 10);
    res.json({ matches: ranked });
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/listings/:id
router.get("/:id", async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id).populate(
      "owner",
      "name avatarColor ratingAverage department bio"
    );
    if (!listing) return res.status(404).json({ message: "Listing not found" });
    res.json({ listing });
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/listings
router.post("/", protect, async (req, res, next) => {
  try {
    const { type, title, description, category, tags, availability, pricingType, price, currency } =
      req.body;

    // Server-side validation
    if (!type || !title || !description || !category) {
      return res.status(400).json({ message: "Type, title, description and category are required." });
    }

    if (title.trim().length < 3) {
      return res.status(400).json({ message: "Title must be at least 3 characters long." });
    }

    if (description.trim().length < 10) {
      return res.status(400).json({ message: "Description must be at least 10 characters long." });
    }

    if (pricingType === "paid" && (price === undefined || price === null || Number(price) < 0)) {
      return res.status(400).json({ message: "Please specify a valid non-negative price for paid items." });
    }

    const listing = await Listing.create({
      owner: req.user._id,
      type,
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      availability: availability || "Flexible",
      pricingType: pricingType === "paid" ? "paid" : "free",
      price: pricingType === "paid" ? Number(price) : undefined,
      currency: currency || "LKR",
      tags: Array.isArray(tags)
        ? tags.map((t) => t.toLowerCase().trim()).filter(Boolean)
        : (tags || "").split(",").map((t) => t.toLowerCase().trim()).filter(Boolean),
    });

    res.status(201).json({ listing });
  } catch (err) {
    next(err);
  }
});

// @route   PUT /api/listings/:id
router.put("/:id", protect, async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: "Listing not found" });
    if (listing.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only edit your own listings" });
    }

    // Input validation on update
    if (req.body.title !== undefined && req.body.title.trim().length < 3) {
      return res.status(400).json({ message: "Title must be at least 3 characters long." });
    }
    if (req.body.description !== undefined && req.body.description.trim().length < 10) {
      return res.status(400).json({ message: "Description must be at least 10 characters long." });
    }
    if (req.body.pricingType === "paid" && (req.body.price === undefined || Number(req.body.price) < 0)) {
      return res.status(400).json({ message: "Price must be a valid non-negative amount." });
    }

    const editableFields = [
      "type",
      "title",
      "description",
      "category",
      "tags",
      "availability",
      "status",
      "pricingType",
      "price",
      "currency",
    ];

    editableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === "tags" && typeof req.body[field] === "string") {
          listing[field] = req.body[field].split(",").map((t) => t.trim().toLowerCase()).filter(Boolean);
        } else if (field === "price" && req.body.pricingType === "free") {
          listing.price = undefined;
        } else {
          listing[field] = req.body[field];
        }
      }
    });

    await listing.save();
    res.json({ listing });
  } catch (err) {
    next(err);
  }
});

// @route   DELETE /api/listings/:id
router.delete("/:id", protect, async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: "Listing not found" });
    if (listing.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only delete your own listings" });
    }

    await listing.deleteOne();
    res.json({ message: "Listing deleted safely" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
