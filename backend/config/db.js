const mongoose = require("mongoose");

/**
 * Connects to MongoDB using the URI in the environment variables.
 * The app intentionally fails fast if the DB is unreachable, so
 * connection problems surface immediately during development.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
