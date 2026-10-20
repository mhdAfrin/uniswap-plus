const express = require("express");
const { Opportunity } = require("../models/models");
const { protect } = require("../middleware/middleware");

const router = express.Router();

// @route   GET /api/opportunities?type=&q=
router.get("/", async (req, res, next) => {
  try {
    const { type, q } = req.query;
    const filter = {};

    if (type) filter.type = type;
    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { tags: { $regex: q, $options: "i" } },
      ];
    }

    const opportunities = await Opportunity.find(filter)
      .populate("postedBy", "name avatarColor department")
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({ opportunities });
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/opportunities
router.post("/", protect, async (req, res, next) => {
  try {
    const { title, description, type, tags, deadline, link } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "title and description are required" });
    }

    const opportunity = await Opportunity.create({
      postedBy: req.user._id,
      title,
      description,
      type,
      deadline,
      link,
      tags: Array.isArray(tags)
        ? tags.map((t) => t.toLowerCase().trim())
        : (tags || "").split(",").map((t) => t.toLowerCase().trim()).filter(Boolean),
    });

    res.status(201).json({ opportunity });
  } catch (err) {
    next(err);
  }
});

// @route   DELETE /api/opportunities/:id
router.delete("/:id", protect, async (req, res, next) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);
    if (!opportunity) return res.status(404).json({ message: "Opportunity not found" });
    if (opportunity.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only delete your own posts" });
    }

    await opportunity.deleteOne();
    res.json({ message: "Opportunity deleted" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
