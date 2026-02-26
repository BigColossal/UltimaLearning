import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    trim: true,
    sparse: true, // Allow null for OAuth-only users
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  name: {
    type: String,
    default: "",
  },
  passwordHash: {
    type: String,
    default: null, // null for OAuth-only users
  },
  profileImage: {
    type: String,
    default: null,
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },
  loginMethods: {
    type: [String], // 'email', 'google'
    default: [],
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("passwordHash")) {
    return next();
  }

  try {
    if (this.passwordHash) {
      const salt = await bcrypt.genSalt(10);
      this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    }
    this.updatedAt = Date.now();
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (password) {
  if (!this.passwordHash) return false;
  return await bcrypt.compare(password, this.passwordHash);
};

// Method to exclude sensitive data
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  return obj;
};

const User = mongoose.model("User", userSchema);

export default User;
