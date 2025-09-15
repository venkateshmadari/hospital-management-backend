const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../../utils/prisma");
const dotenv = require("dotenv");
const sendMail = require("../../utils/email");
const { otptemplate } = require("../../utils/otptemplate");
dotenv.config();

const doctorRegister = async (req, res, next) => {
  try {
    const { name, email, password, designation, speciality } = req.body;

    if (!name || !email || !password || !designation || !speciality) {
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
      data: { name, email, password: hashedPassword, designation, speciality },
    });

    return res.status(201).json({
      success: true,
      message: "Account registered successfully",
    });
  } catch (error) {
    next(error);
  }
};

const doctorLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const doctor = await prisma.doctors.findUnique({ where: { email } });
    if (!doctor) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }
    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }
    if (doctor.status !== "ACTIVE") {
      return res.status(401).json({
        success: false,
        message: "Only approved accounts can access",
      });
    }

    const token = jwt.sign(
      {
        id: doctor.id,
        email: doctor.email,
        role: doctor.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      success: true,
      token,
      role: doctor.role,
    });
  } catch (error) {
    next(error);
  }
};

const doctorGetUserData = async (req, res, next) => {
  try {
    const doctor = await prisma.doctors.findUnique({
      where: { id: req.doctors.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        designation: true,
        createdAt: true,
        description: true,
        image: true,
        speciality: true,
        status: true,
        Avability: true,
        DoctorPermissions: {
          select: {
            id: true,
            permission: {
              select: {
                id: true,
                name: true,
                label: true,
              }
            }
          }
        }
      },
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const permissions = doctor.DoctorPermissions.map(
      (dp) => dp.permission
    );
    return res.status(200).json({
      success: true,
      user: {
        ...doctor,
        permissions
      },
      role: doctor.role,
    });
  } catch (error) {
    next(error);
  }
};

const doctorForgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const doctor = await prisma.doctors.findUnique({ where: { email } });

    if (!doctor) {
      return res.status(404).json({ message: "doctor not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await prisma.otp.create({
      data: {
        otp,
        userId: doctor.id,
        expiredAt: expiresAt,
      },
    });

    const emailTemplate = otptemplate(doctor.name, otp);
    await sendMail(doctor.email, "Password Reset OTP", emailTemplate);

    return res.status(200).json({
      success: true,
      message: "OTP sent to your email",
    });
  } catch (error) {
    next(error);
  }
};

const doctorVerifyOtp = async (req, res, next) => {
  try {
    const { otp, email } = req.body;
    if (!email || !otp) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }
    const doctor = await prisma.doctors.findUnique({ where: { email } });
    if (!doctor) {
      return res.status(404).json({ message: "No user found" });
    }
    const otpRecord = await prisma.otp.findFirst({
      where: { userId: doctor.id },
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

const doctorResetPassword = async (req, res, next) => {
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
    const doctor = await prisma.doctors.findUnique({
      where: {
        email,
      },
    });

    if (!doctor) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.doctors.update({
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
  doctorRegister,
  doctorLogin,
  doctorGetUserData,
  doctorForgotPassword,
  doctorVerifyOtp,
  doctorResetPassword,
};
