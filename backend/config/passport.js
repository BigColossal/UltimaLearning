import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";
import crypto from "crypto";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:
        process.env.GOOGLE_CALLBACK_URL ||
        "http://localhost:5000/api/auth/google/callback",
    },
    async (_, __, profile, done) => {
      let user = await User.findOne({ googleId: profile.id });

      if (!user) {
        const email =
          profile.emails?.[0]?.value || `user${Date.now()}@temp.com`;
        const username = profile.displayName;

        user = await User.create({
          googleId: profile.id,
          username,
          email,
          avatar: profile.photos?.[0]?.value,
        });
      }

      done(null, user);
    },
  ),
);
