import "./config/dotenv.js";

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import skillRoutes from "./routes/skillRoutes.js";
import domainRoutes from "./routes/domainRoutes.js";
import subskillRoutes from "./routes/subskillRoutes.js";
import userRoutes from "./routes/userRoutes.js";

import cookieParser from "cookie-parser";
import passport from "passport";
import "./config/passport.js";
import authRoutes from "./routes/authRoutes.js";
import { protect } from "./middleware/authMiddleware.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cookieParser());
app.use(passport.initialize());
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", protect, userRoutes);
app.use("/api/skills", protect, skillRoutes);
app.use("/api/domains", protect, domainRoutes);
app.use("/api/subskills", protect, subskillRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "UltimaLearning API is running" });
});

// Connect to MongoDB
mongoose
  .connect(
    process.env.MONGODB_URI || "mongodb://localhost:27017/ultimalearning",
  )
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });

export default app;
