const jwt = require("jsonwebtoken");
const { User } = require("../models/models");

/**
 * Verifies the Bearer JWT on the request and attaches the authenticated
 * user (minus the password) to req.user. Any route that needs a logged-in
 * user is wrapped with this.
 */
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized, no token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "Not authorized, user no longer exists" });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Not authorized, token invalid or expired" });
  }
};

/**
 * Restricts a route to specific roles, e.g. requireRole("moderator", "admin").
 * Must run after `protect`.
 */
const requireRole = (...allowedRoles) => (req, res, next) => {
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ message: "You do not have permission to do this" });
  }
  next();
};

/**
 * Central error handler. Keeps controllers free of repetitive try/catch
 * boilerplate for unexpected errors — routes still catch expected
 * validation issues explicitly.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    message: err.message || "Something went wrong on the server",
  });
};

const notFound = (req, res) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
};

module.exports = { protect, requireRole, errorHandler, notFound };
