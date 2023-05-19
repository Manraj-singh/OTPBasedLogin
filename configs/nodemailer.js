const nodemailer = require("nodemailer");

require("dotenv/config");

// Setting up transporter with Gmail service to be able to send mails to the users
let transporter = nodemailer.createTransport(
  {
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  },
  (err) => {
    console.error(err);
    return;
  }
);

module.exports = {
  transporter: transporter,
};
