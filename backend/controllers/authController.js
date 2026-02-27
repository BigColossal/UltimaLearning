import jwt from "jsonwebtoken";
import User from "../models/User.js";

const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
};

const sendTokenResponse = (user, res) => {
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: "strict",
  });

  res.json({
    accessToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  });
};

export const register = async (req, res) => {
  const { name, email, password } = req.body;

  const user = await User.create({ name, email, password });

  sendTokenResponse(user, res);
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  sendTokenResponse(user, res);
};

export const refreshToken = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ message: "No token" });

  const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

  const accessToken = generateAccessToken(decoded.userId);

  res.json({ accessToken });
};

export const logout = (req, res) => {
  res.clearCookie("refreshToken");
  res.json({ message: "Logged out" });
};
