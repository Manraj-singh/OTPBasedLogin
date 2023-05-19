const mongoose = require("mongoose");
const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    otp: {
      type: String,
      required: true,
    },

    //after 5 mins it will get deleted from database
    createdAt: {
      type: Date,
      default: Date.now,
      expires: "5m",
    },
  },
  { timestamps: true }
);

const Otp = mongoose.model("Otp", otpSchema);

module.exports = Otp;
