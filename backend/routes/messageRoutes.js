const express = require("express");
const { Message } = require("../models/models");
const { protect } = require("../middleware/middleware");

const router = express.Router();

// @route   GET /api/messages/inbox
// Returns the most recent message from every conversation the user is part of.
router.get("/inbox", protect, async (req, res, next) => {
  try {
    const userId = req.user._id;

    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }],
    })
      .populate("sender", "name avatarColor")
      .populate("receiver", "name avatarColor")
      .sort({ createdAt: -1 });

    // Collapse into one row per conversation partner (most recent message).
    const conversations = new Map();
    messages.forEach((msg) => {
      const partner =
        msg.sender._id.toString() === userId.toString() ? msg.receiver : msg.sender;
      const key = partner._id.toString();
      if (!conversations.has(key)) {
        conversations.set(key, { partner, lastMessage: msg });
      }
    });

    res.json({ conversations: Array.from(conversations.values()) });
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/messages/thread/:userId  -> full conversation with one user
router.get("/thread/:userId", protect, async (req, res, next) => {
  try {
    const userId = req.user._id;
    const otherId = req.params.userId;

    const thread = await Message.find({
      $or: [
        { sender: userId, receiver: otherId },
        { sender: otherId, receiver: userId },
      ],
    })
      .populate("sender", "name avatarColor")
      .sort({ createdAt: 1 });

    // Mark incoming messages in this thread as read.
    await Message.updateMany(
      { sender: otherId, receiver: userId, isRead: false },
      { isRead: true }
    );

    res.json({ thread });
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/messages
router.post("/", protect, async (req, res, next) => {
  try {
    const { receiver, content, relatedListing, relatedRequest } = req.body;

    if (!receiver || !content) {
      return res.status(400).json({ message: "receiver and content are required" });
    }
    if (receiver === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot message yourself" });
    }

    const message = await Message.create({
      sender: req.user._id,
      receiver,
      content,
      relatedListing: relatedListing || undefined,
      relatedRequest: relatedRequest || undefined,
    });

    const populated = await message.populate("sender", "name avatarColor");
    res.status(201).json({ message: populated });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
