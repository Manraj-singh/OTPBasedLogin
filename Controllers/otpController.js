const bcrypt = require("bcrypt");
const otpGenerator = require("otp-generator");
const { User, Otp } = require("../Model");
const jwt = require("jsonwebtoken");
// const nodeMailer = require("../nodemailer");
const nodeMailer = require("../configs/nodemailer");

// Create a transporter for sending emails

module.exports.signup = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({
      success: false,
      message: "please enter your email to register",
    });
  }
  try {
    const usr = await User.findOne({ email });
    if (usr) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }
    //registerr email in DB
    const user = new User({ email });
    await user.save();
    return res.status(400).json({
      success: true,
      message: "Email registered Successfully",
      data: email,
    });
  } catch (error) {
    console.error("Error while signining up:", error);
    res
      .status(500)
      .json({ success: false, message: "An error occurred while signup" });
  }
};
module.exports.generateOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res
      .status(400)
      .json({ success: false, message: "please enter email" });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json(
          "your email id is not registered . please use '/signup' endpoint to register your email. "
        );
    }
    // Check if there is a recent OTP entry for the email
    const recentOTP = await Otp.findOne({ email })
      .sort({ createdAt: -1 })
      .exec();
    if (recentOTP && recentOTP.createdAt.getTime() + 60000 > Date.now()) {
      // If a recent OTP exists, and less than 1 minute has passed, return an error
      return res.status(429).json({
        success: false,
        message:
          "Please wait for at least 1 minute before generating a new OTP.",
      });
    }

    //else Generate a new OTP
    const generatedOTP = otpGenerator.generate(6, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });
    //encrypt the otp to save in DB
    const salt = await bcrypt.genSalt(10);
    const encryptedOTP = await bcrypt.hash(generatedOTP, salt);

    // Save the OTP in the database as encrypted
    const otpEntry = new Otp({ email, otp: encryptedOTP });
    await otpEntry.save();

    // Send the OTP to the user's email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "OTP for verification",
      text: `Your OTP is: ${generatedOTP}. it is valid for 5 mins`,
    };
    nodeMailer.transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        return res
          .status(500)
          .json({ status: false, message: "Failed to send OTP." });
      }
      res
        .status(200)
        .json({ status: true, message: `OTP sent successfully to ${email}` });
    });
  } catch (error) {
    console.error("Error generating OTP:", error);
    res.status(500).json({
      status: false,
      message: "An error occurred while generating OTP.",
    });
  }
};

// Login API endpoint
module.exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!(email && otp)) {
    return res
      .status(400)
      .json({ status: false, message: "incomplete data received" });
  }
  try {
    const userDetails = await User.findOne({ email });
    // Check if the user's account is blocked
    const isBlocked = await User.countDocuments({
      email,
      // createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) },
      failedAttempts: { $gte: 5 },
    });

    if (isBlocked) {
      // If the user's account is blocked, return an error with the remaining time until login can be reattempted
      const remainingTime =
        60 -
        Math.ceil((Date.now() - userDetails.lockedAt.getTime()) / (60 * 1000));

      if (remainingTime > 0) {
        return res.status(403).json({
          status: false,
          message: `Account blocked. Try again after ${remainingTime} minutes.`,
        });
      } else {
        userDetails.failedAttempts = 0;

        await userDetails.save();
      }
    }
    // Find the latest OTP entry for the email
    const latestOTP = await Otp.findOne({ email })
      .sort({ createdAt: -1 })
      .exec();
    if (!latestOTP) {
      // If no OTP entry found, return an error
      return res
        .status(401)
        .json({ status: false, message: "Invalid OTP or email." });
    }
    // Compare the provided OTP with the hashed OTP stored in the database
    const isOTPValid = await bcrypt.compare(otp, latestOTP.otp);
    if (isOTPValid) {
      // Delete the OTP entry so it can't be reused
      await Otp.deleteOne({ _id: latestOTP._id });
      userDetails.failedAttempts = 0;

      await userDetails.save();
      // Generate a new JWT token
      const token = jwt.sign({ email }, process.env.JWT_SECRETKEY, {
        expiresIn: "1h",
      });

      // Return the JWT token in the response
      return res.status(200).json({ status: true, token: token });
    }

    // Increment the failed attempts count and save the OTP entry
    userDetails.failedAttempts = (userDetails.failedAttempts || 0) + 1;
    await userDetails.save();

    // Check if the user has reached the maximum failed attempts
    if (userDetails.failedAttempts >= 5) {
      // If the user has reached the maximum failed attempts, block the account
      userDetails.lockedAt = Date.now();
      await userDetails.save();
      return res.status(403).json({
        status: false,
        message: "Account blocked. Try again after 1 hour.",
      });
    }

    // Return an error indicating the OTP is invalid
    res.status(401).json({ error: "Invalid OTP or email." });
  } catch (error) {
    console.error("Error during login:", error);
    res
      .status(500)
      .json({ status: false, message: "An error occurred during login." });
  }
};
