import express from "express";
import passport from "passport";
import {
  register,
  login,
  refreshToken,
  logout,
  getCurrentUser,
} from "../controllers/authController.js";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refreshToken);
router.post("/logout", logout);
router.get("/me", getCurrentUser);

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login`,
  }),
  async (req, res) => {
    const accessToken = jwt.sign(
      { userId: req.user._id },
      process.env.JWT_SECRET,
      { expiresIn: "15m" },
    );

    const refreshToken = jwt.sign(
      { userId: req.user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" },
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    res.redirect(`/oauth-success?token=${accessToken}&userId=${req.user._id}`);
  },
);

export default router;
