const router = require("express").Router();

router.use("/api/user", require("./otpRoute"));

//falback route
router.use("*", (req, res) => {
  return res.status(404).json({
    status: false,
    messag: "404 , wrong endpoint",
    data: " endpoints are '/api/user/signup ' , '/api/user/generate-otp ' , '/api/user/verify ' ",
  });
});
module.exports = router;
