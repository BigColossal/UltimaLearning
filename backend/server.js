import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import nodeRoutes from "./routes/nodeRoutes.js";
// import testRoutes from "./routes/testRoutes.js";
// import projectRoutes from "./routes/projectRoutes.js";
import skillRoutes from "./routes/skillRoutes.js";
import domainRoutes from "./routes/domainRoutes.js";
import subskillRoutes from "./routes/subskillRoutes.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" })); // Allow larger payloads for code submissions

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/nodes", nodeRoutes);
app.use("/api/users", userRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/domains", domainRoutes);
app.use("/api/subskills", subskillRoutes);

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
