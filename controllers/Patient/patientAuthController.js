const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../../utils/prisma");
const dotenv = require("dotenv");
const sendMail = require("../../utils/email");
const { otptemplate } = require("../../utils/otptemplate");
dotenv.config();

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const existingPatient = await prisma.patient.findUnique({
      where: { email },
    });
    if (existingPatient) {
      return res.status(409).json({
        success: false,
        message: "Email already in use",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newPatient = await prisma.patient.create({
      data: { name, email, password: hashedPassword },
    });

    return res.status(201).json({
      message: "Account registered successfully",
      success: true,
      patient: {
        id: newPatient.id,
        name: newPatient.name,
        email: newPatient.email,
        role: newPatient.role,
        createdAt: newPatient.createdAt,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const patient = await prisma.patient.findUnique({ where: { email } });
    if (!patient) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }
    const isMatch = await bcrypt.compare(password, patient.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }
    const token = jwt.sign(
      {
        id: patient.id,
        email: patient.email,
        role: patient.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: 60 * 60 * 24 * 7 } //7days
    );

    return res.status(200).json({
      success: true,
      token,
    });
  } catch (error) {
    next(error);
  }
};

const getUserData = async (req, res, next) => {
  try {
    const patient = await prisma.patient.findUnique({
      where: { id: req.patient.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        phoneNumber: true,
        createdAt: true,
      },
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    const formattedPatient = {
      ...patient,
      image: patient.image
        ? `${req.protocol}://${req.get("host")}${patient.image.replace(
          /\\/g,
          "/"
        )}`
        : null,
    };

    return res.status(200).json({
      success: true,
      patient: formattedPatient,
    });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const patient = await prisma.patient.findUnique({ where: { email } });

    if (!patient) {
      return res.status(404).json({ message: "patient not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await prisma.otp.create({
      data: {
        otp,
        userId: patient.id,
        expiredAt: expiresAt,
      },
    });

    const emailTemplate = otptemplate(patient.name, otp);
    await sendMail(patient.email, "Password Reset OTP", emailTemplate);

    return res.status(200).json({
      success: true,
      message: "OTP sent to your email",
    });
  } catch (error) {
    next(error);
  }
};

const verifyOtp = async (req, res, next) => {
  try {
    const { otp, email } = req.body;
    if (!email || !otp) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }
    const patient = await prisma.patient.findUnique({ where: { email } });
    if (!patient) {
      return res.status(404).json({ message: "patient not found" });
    }
    const otpRecord = await prisma.otp.findFirst({
      where: { userId: patient.id },
    });
    if (!otpRecord) {
      return res.status(404).json({ message: "OTP not found" });
    }
    if (otpRecord.otp !== parseInt(otp)) {
      return res.status(400).json({ message: "Invalid OTP" });
    }
    if (otpRecord.expiredAt < new Date()) {
      await prisma.otp.deleteMany({ where: { otp: otpRecord.otp } });
      return res.status(400).json({ message: "OTP expired" });
    }

    await prisma.otp.deleteMany({ where: { otp: otpRecord.otp } });

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;
    if (!email || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (newPassword !== confirmPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Passwords do not match" });
    }
    const patient = await prisma.patient.findUnique({
      where: {
        email,
      },
    });

    if (!patient) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.patient.update({
      where: { email },
      data: { password: hashedPassword },
    });
    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getUserData,
  forgotPassword,
  verifyOtp,
  resetPassword,
};
