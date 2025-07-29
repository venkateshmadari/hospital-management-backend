const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../utils/prisma");
const dotenv = require("dotenv");
const sendMail = require("../utils/email");
const { otptemplate } = require("../utils/otptemplate");
dotenv.config();

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (!["ADMIN", "DOCTOR", "PATIENT"].includes(role)) {
      return res.status(400).json({
        success: false,
        error: "Invalid role specified",
      });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already in use",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: { name, email, password: hashedPassword, role },
    });

    return res.status(201).json({
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        createdAt: newUser.createdAt,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

const doctorRegister = async (req, res, next) => {
  try {
    const { name, email, password, designation } = req.body;

    if (!name || !email || !password || !designation) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const existingDoctor = await prisma.doctors.findUnique({
      where: { email },
    });
    if (existingDoctor) {
      return res.status(409).json({
        success: false,
        message: "Email already in use",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newDoctor = await prisma.doctors.create({
      data: { name, email, password: hashedPassword, designation },
    });

    return res.status(201).json({
      success: true,
      doctor: {
        id: newDoctor.id,
        name: newDoctor.name,
        email: newDoctor.email,
        designation: newDoctor.designation,
        createdAt: newDoctor.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      success: true,
      token,
    });
  } catch (error) {
    next(error);
  }
};

const getUserData = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await prisma.otp.create({
      data: {
        otp,
        userId: user.id,
        expiredAt: expiresAt,
      },
    });

    const emailTemplate = otptemplate(user.name, otp);
    await sendMail(user.email, "Password Reset OTP", emailTemplate);

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
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }
    const otpRecord = await prisma.otp.findFirst({
      where: { userId: user.id },
    });
    if (!otpRecord) {
      return res.status(404).json({ message: "OTP not found" });
    }
    if (otpRecord.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }
    if (otpRecord.expiredAt < new Date()) {
      await prisma.otp.delete({ where: { otp: otpRecord.otp } });
      return res.status(400).json({ message: "OTP expired" });
    }

    await prisma.otp.delete({ where: { otp: otpRecord.otp } });

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
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
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
  doctorRegister,
};

// PORT=3030

// DATABASE_URL="mysql://root:@localhost:3306/hospital"
// # DATABASE_URL="mysql://root:upendar%2F%2F2200@localhost:3306/hospital"
// JWT_SECRET=709e88e9434b088060185a1ef3a205d3c5e8e985da163007e0ce930781e31b45c108389e3f9cb9e79d0f1c59c7666b2b6021f6dc96ce62a30861ad8ab702f4f0

// EMAIL_PASS=momo bpdw ghmh typy
// EMAIL_USER=venkatesh@spackdigi.com
