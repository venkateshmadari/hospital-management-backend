const nodemailer = require("nodemailer");
const transport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendMail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
    };
    const res = await transport.sendMail(mailOptions);
    console.log("Mail sent successfully:");
  } catch (error) {
    throw new Error("Failed to send email");
  }
};

module.exports = sendMail;
