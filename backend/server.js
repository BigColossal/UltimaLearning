import "./config/dotenv.js";

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import skillRoutes from "./routes/skillRoutes.js";
import domainRoutes from "./routes/domainRoutes.js";
import subskillRoutes from "./routes/subskillRoutes.js";
import userRoutes from "./routes/userRoutes.js";

import cookieParser from "cookie-parser";
import passport from "passport";
import "./config/passport.js";
import authRoutes from "./routes/authRoutes.js";
import { protect } from "./middleware/authMiddleware.js";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 min
  max: 100, // 100 requests per IP
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 20, // 25 login attempts per 15 mins
});

// Middleware
app.use(passport.initialize());
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        connectSrc: [
          "'self'",
          "http://localhost:5000",
          "http://localhost:3000",
        ],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:"],
      },
    },
  }),
);
app.use(cookieParser());
app.set("trust proxy", 1);
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? true
        : ["http://localhost:3000", "http://localhost:5000"],
    credentials: true,
  }),
);
app.use(express.json());
app.use("/api", limiter);
app.use("/api/auth/login", authLimiter);

app.get("/.well-known/appspecific/com.chrome.devtools.json", (req, res) => {
  res.json({});
});

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

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../frontend/dist", "index.html"));
  });
}

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
