const router = require("express").Router();
const { otpController } = require("../Controllers");

//to register your email id
router.post("/signup", otpController.signup);
// to generate otp and send over mail
router.post("/generate-otp", otpController.generateOtp);
//to verify otp and return jwt token
router.post("/verify", otpController.verifyOtp);

module.exports = router;
