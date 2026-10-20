const express = require("express");
const { User, Listing, Review } = require("../models/models");
const { protect } = require("../middleware/middleware");

const router = express.Router();

// @route   GET /api/users/:id  -> public profile + their active listings
router.get("/:id", async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    const listings = await Listing.find({ owner: user._id, status: "active" }).sort({
      createdAt: -1,
    });
    const reviews = await Review.find({ reviewee: user._id })
      .populate("reviewer", "name avatarColor")
      .sort({ createdAt: -1 });

    res.json({ user, listings, reviews });
  } catch (err) {
    next(err);
  }
});

// @route   PUT /api/users/me  -> update own profile
router.put("/me", protect, async (req, res, next) => {
  try {
    const editableFields = [
      "name",
      "bio",
      "faculty",
      "department",
      "yearOfStudy",
      "skills",
      "interests",
      "avatarColor",
    ];

    editableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        req.user[field] = req.body[field];
      }
    });

    await req.user.save();
    res.json({ user: req.user });
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/users?skill=react  -> directory search by skill/interest
router.get("/", async (req, res, next) => {
  try {
    const { skill, q } = req.query;
    const filter = {};

    if (skill) filter.skills = { $regex: skill, $options: "i" };
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { skills: { $regex: q, $options: "i" } },
        { interests: { $regex: q, $options: "i" } },
      ];
    }

    const users = await User.find(filter).select("-password").limit(50);
    res.json({ users });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
