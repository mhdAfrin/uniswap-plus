const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models/models");
const { protect } = require("../middleware/middleware");

const router = express.Router();

const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

// @route   POST /api/auth/register
router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password, studentId, faculty, department, yearOfStudy } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      studentId,
      faculty,
      department,
      yearOfStudy,
    });

    const token = generateToken(user._id);
    const { password: _omit, ...safeUser } = user.toObject();

    res.status(201).json({ token, user: safeUser });
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/auth/login
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user._id);
    const { password: _omit, ...safeUser } = user.toObject();

    res.json({ token, user: safeUser });
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/auth/me
router.get("/me", protect, async (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
