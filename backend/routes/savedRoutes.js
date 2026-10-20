const express = require("express");
const { SavedItem, Listing, Request, Opportunity } = require("../models/models");
const { protect } = require("../middleware/middleware");

const router = express.Router();

const MODELS = { listing: Listing, request: Request, opportunity: Opportunity };

// @route   GET /api/saved  -> the current user's saved items, populated with the real record
router.get("/", protect, async (req, res, next) => {
  try {
    const saved = await SavedItem.find({ user: req.user._id }).sort({ createdAt: -1 });

    const populated = await Promise.all(
      saved.map(async (entry) => {
        const Model = MODELS[entry.itemType];
        const item = await Model.findById(entry.itemId).populate(
          "owner postedBy",
          "name avatarColor"
        );
        return { _id: entry._id, itemType: entry.itemType, item };
      })
    );

    res.json({ saved: populated.filter((entry) => entry.item) });
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/saved/ids  -> lightweight list of saved itemIds, for marking hearts as filled
router.get("/ids", protect, async (req, res, next) => {
  try {
    const saved = await SavedItem.find({ user: req.user._id }).select("itemType itemId");
    res.json({ saved });
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/saved/toggle  { itemType, itemId }
router.post("/toggle", protect, async (req, res, next) => {
  try {
    const { itemType, itemId } = req.body;
    if (!MODELS[itemType] || !itemId) {
      return res.status(400).json({ message: "A valid itemType and itemId are required" });
    }

    const existing = await SavedItem.findOne({ user: req.user._id, itemType, itemId });
    if (existing) {
      await existing.deleteOne();
      return res.json({ saved: false });
    }

    await SavedItem.create({ user: req.user._id, itemType, itemId });
    res.json({ saved: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
