import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { OAuth2Client } from "google-auth-library";
import { sendWelcomeEmail } from "../services/emailService.js";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_EXPIRY = "7d";

const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
};

const googleClient = new OAuth2Client(process.env.REACT_GOOGLE_CLIENT_ID);

export const signup = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validation
    if (!email || !password || !name) {
      return res
        .status(400)
        .json({ message: "Email, password, and name are required" });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters" });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }

    // Create user with email/password
    const user = new User({
      email: email.toLowerCase(),
      name,
      passwordHash: password,
      loginMethods: ["email"],
    });

    await user.save();

    // Send welcome email
    try {
      await sendWelcomeEmail(user);
    } catch (err) {
      console.error("Failed to send welcome email:", err);
      // Don't fail the signup if email fails
    }

    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Signup failed" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user || !user.passwordHash) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed" });
  }
};

export const googleAuth = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Google token is required" });
    }

    // Verify Google token
    let ticket;
    try {
      ticket = await googleClient.verifyIdToken({
        idToken: token,
        audience: process.env.REACT_GOOGLE_CLIENT_ID,
      });
    } catch (error) {
      return res.status(401).json({ message: "Invalid Google token" });
    }

    const payload = ticket.getPayload();
    const { email, name, picture: profileImage, sub: googleId } = payload;

    // Check if user exists by Google ID
    let user = await User.findOne({ googleId });

    if (!user) {
      // Check if user exists by email
      user = await User.findOne({ email });

      if (user) {
        // Link Google to existing email account
        user.googleId = googleId;
        if (!user.loginMethods.includes("google")) {
          user.loginMethods.push("google");
        }
        await user.save();
      } else {
        // Create new user
        const isNewUser = true;
        user = new User({
          email,
          name,
          googleId,
          profileImage,
          loginMethods: ["google"],
        });
        await user.save();

        // Send welcome email for new user
        try {
          await sendWelcomeEmail(user);
        } catch (err) {
          console.error("Failed to send welcome email:", err);
        }
      }
    }

    const jwtToken = generateToken(user._id);

    res.json({
      token: jwtToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error("Google auth error:", error);
    res.status(500).json({ message: "Google authentication failed" });
  }
};

export const refresh = async (req, res) => {
  try {
    const { userId } = req;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(500).json({ message: "Token refresh failed" });
  }
};

export const logout = async (req, res) => {
  // Logout is handled client-side by removing token
  // This endpoint can be used for logging user out on backend if needed
  res.json({ message: "Logged out successfully" });
};

export const getMe = async (req, res) => {
  try {
    const { userId } = req;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      id: user._id,
      email: user.email,
      name: user.name,
      profileImage: user.profileImage,
      loginMethods: user.loginMethods,
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Failed to get user" });
  }
};
