const express = require("express");
const { Advertisement } = require("../models/models");

const router = express.Router();

// @route   GET /api/advertisements
// @desc    Get all active campus advertisements & promo banners
// @access  Public
router.get("/", async (req, res, next) => {
  try {
    const advertisements = await Advertisement.find({ isActive: true })
      .sort({ priority: -1, createdAt: -1 })
      .limit(20);
    res.json({ advertisements });
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/advertisements/:id
// @desc    Get single advertisement details
// @access  Public
router.get("/:id", async (req, res, next) => {
  try {
    const advertisement = await Advertisement.findById(req.params.id);
    if (!advertisement) {
      return res.status(404).json({ message: "Advertisement not found" });
    }
    res.json({ advertisement });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
