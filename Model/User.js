const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
//defining user schema
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    failedAttempts: {
      type: Number,
      default: 0,
    },
    lockedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
