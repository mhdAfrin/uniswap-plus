const express = require("express");
const { Request, Listing } = require("../models/models");
const { protect } = require("../middleware/middleware");
const { rankMatches } = require("../utils/matcher");

const router = express.Router();

// @route   GET /api/requests?category=&q=&tags=&sortBy=
router.get("/", async (req, res, next) => {
  try {
    const { category, q, tags, sortBy } = req.query;
    const filter = { status: "open" };

    if (category) filter.category = { $regex: category, $options: "i" };
    if (tags) filter.tags = { $in: tags.split(",").map((t) => t.trim().toLowerCase()) };
    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { tags: { $regex: q, $options: "i" } },
      ];
    }

    // Determine sort ordering based on query parameter
    let sortOrder = { createdAt: -1 }; // default: newest requests first
    if (sortBy === "oldest") {
      sortOrder = { createdAt: 1 };
    } else if (sortBy === "title_asc") {
      sortOrder = { title: 1 };
    } else if (sortBy === "title_desc") {
      sortOrder = { title: -1 };
    }

    const requests = await Request.find(filter)
      .populate("owner", "name avatarColor ratingAverage department")
      .sort(sortOrder)
      .limit(100);

    res.json({ requests });
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/requests/mine
router.get("/mine", protect, async (req, res, next) => {
  try {
    const requests = await Request.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.json({ requests });
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/requests/:id/matches -> active listings that best match this request
router.get("/:id/matches", async (req, res, next) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    const candidateListings = await Listing.find({ status: "active" }).populate(
      "owner",
      "name avatarColor"
    );

    const ranked = rankMatches(request, candidateListings).slice(0, 10);
    res.json({ matches: ranked });
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/requests/:id
router.get("/:id", async (req, res, next) => {
  try {
    const request = await Request.findById(req.params.id).populate(
      "owner",
      "name avatarColor ratingAverage department bio"
    );
    if (!request) return res.status(404).json({ message: "Request not found" });
    res.json({ request });
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/requests
router.post("/", protect, async (req, res, next) => {
  try {
    const { title, description, category, tags, urgency } = req.body;

    // Server-side validation
    if (!title || !description || !category) {
      return res.status(400).json({ message: "Title, description and category are required." });
    }

    if (title.trim().length < 3) {
      return res.status(400).json({ message: "Title must be at least 3 characters long." });
    }

    if (description.trim().length < 10) {
      return res.status(400).json({ message: "Description must be at least 10 characters long." });
    }

    if (urgency && !["low", "medium", "high"].includes(urgency)) {
      return res.status(400).json({ message: "Urgency must be low, medium, or high." });
    }

    const request = await Request.create({
      owner: req.user._id,
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      urgency: urgency || "medium",
      tags: Array.isArray(tags)
        ? tags.map((t) => t.toLowerCase().trim()).filter(Boolean)
        : (tags || "").split(",").map((t) => t.toLowerCase().trim()).filter(Boolean),
    });

    res.status(201).json({ request });
  } catch (err) {
    next(err);
  }
});

// @route   PUT /api/requests/:id
router.put("/:id", protect, async (req, res, next) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });
    if (request.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only edit your own requests" });
    }

    // Validation checks on update
    if (req.body.title !== undefined && req.body.title.trim().length < 3) {
      return res.status(400).json({ message: "Title must be at least 3 characters long." });
    }
    if (req.body.description !== undefined && req.body.description.trim().length < 10) {
      return res.status(400).json({ message: "Description must be at least 10 characters long." });
    }
    if (req.body.urgency && !["low", "medium", "high"].includes(req.body.urgency)) {
      return res.status(400).json({ message: "Urgency must be low, medium, or high." });
    }

    const editableFields = ["title", "description", "category", "tags", "urgency", "status"];
    editableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === "tags" && typeof req.body[field] === "string") {
          request[field] = req.body[field].split(",").map((t) => t.trim().toLowerCase()).filter(Boolean);
        } else {
          request[field] = req.body[field];
        }
      }
    });

    await request.save();
    res.json({ request });
  } catch (err) {
    next(err);
  }
});

// @route   DELETE /api/requests/:id
router.delete("/:id", protect, async (req, res, next) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });
    if (request.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only delete your own requests" });
    }

    await request.deleteOne();
    res.json({ message: "Request deleted safely" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
