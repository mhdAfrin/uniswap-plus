require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const connectDB = require("./config/db");
const { errorHandler, notFound } = require("./middleware/middleware");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const listingRoutes = require("./routes/listingRoutes");
const requestRoutes = require("./routes/requestRoutes");
const opportunityRoutes = require("./routes/opportunityRoutes");
const messageRoutes = require("./routes/messageRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const savedRoutes = require("./routes/savedRoutes");
const advertisementRoutes = require("./routes/advertisementRoutes");

// Express and HTTP server configuration
const app = express();

// Application-level middleware for CORS, JSON parsing, and HTTP request logging
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  })
);
app.use(express.json());
app.use(morgan("dev"));

// API health status probe
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "UniSwap+ API", time: new Date().toISOString() });
});

// RESTful resource routing
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/opportunities", opportunityRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/saved", savedRoutes);
app.use("/api/advertisements", advertisementRoutes);

// Error handling middleware (catch-all 404 and central error handler)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Connect to MongoDB database instance and listen for incoming HTTP traffic
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`UniSwap+ backend running successfully on port ${PORT}`);
  });
};

startServer();
