const router = require("express").Router();

router.use("/api/user", require("./otpRoute"));

module.exports = router;
