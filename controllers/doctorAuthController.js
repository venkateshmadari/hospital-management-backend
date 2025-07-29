const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../utils/prisma");
const dotenv = require("dotenv");
const sendMail = require("../utils/email");
const { otptemplate } = require("../utils/otptemplate");
dotenv.config();


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

const driverLogin = async (req, res) => {
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
        });
    } catch (error) {
        next(error);
    }
};

const driverGetUserData = async (req, res) => {
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
            },
        });

        if (!doctor) {
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

module.exports = {
    doctorRegister,
    driverLogin,

}