const express = require("express");
const { Review, User } = require("../models/models");
const { protect } = require("../middleware/middleware");

const router = express.Router();

/**
 * Recomputes and stores a user's average rating. Called after every new
 * review so the number shown on profiles/listings is always up to date
 * without recalculating it on every read.
 */
const refreshRatingFor = async (userId) => {
  const reviews = await Review.find({ reviewee: userId });
  const ratingCount = reviews.length;
  const ratingAverage = ratingCount
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / ratingCount
    : 0;

  await User.findByIdAndUpdate(userId, {
    ratingCount,
    ratingAverage: Math.round(ratingAverage * 10) / 10,
  });
};

// @route   POST /api/reviews
router.post("/", protect, async (req, res, next) => {
  try {
    const { reviewee, rating, comment, relatedListing, relatedRequest } = req.body;

    if (!reviewee || !rating) {
      return res.status(400).json({ message: "reviewee and rating are required" });
    }
    if (reviewee === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot review yourself" });
    }

    const review = await Review.create({
      reviewer: req.user._id,
      reviewee,
      rating,
      comment,
      relatedListing: relatedListing || undefined,
      relatedRequest: relatedRequest || undefined,
    });

    await refreshRatingFor(reviewee);

    const populated = await review.populate("reviewer", "name avatarColor");
    res.status(201).json({ review: populated });
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/reviews/user/:id
router.get("/user/:id", async (req, res, next) => {
  try {
    const reviews = await Review.find({ reviewee: req.params.id })
      .populate("reviewer", "name avatarColor")
      .sort({ createdAt: -1 });
    res.json({ reviews });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
