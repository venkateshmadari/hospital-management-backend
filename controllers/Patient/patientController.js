const prisma = require("../../utils/prisma");
const fs = require("fs");
const path = require("path");

const getAllPatients = async (req, res, next) => {
  try {
    const { page = 1, limit = 25, search = "" } = req.query;
    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) / limitNumber;

    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ];
    }
    const patients = await prisma.patient.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      skip,
      take: limitNumber,
      orderBy: { createdAt: "desc" },
    });
    const totalPatients = await prisma.patient.count();
    const totalPages = Math.ceil(totalPatients / limitNumber);
    return res.status(200).json({
      success: true,
      data: patients,
      pagination: {
        totalItems: totalPatients,
        totalPages,
        currentPage: pageNumber,
        itemsPerPage: limitNumber,
        hasNextPage: pageNumber < totalPages,
        hasPreviousPage: pageNumber > 1,
      },
    });
  } catch (error) {
    console.error("Get all patients error:", error);
    next(error);
  }
};

const getPatientById = async (req, res, next) => {
  try {
    const patientId = req.params.id;

    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "patient not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: patient,
    });
  } catch (error) {
    console.error("Get patient error:", error);
    next(error);
  }
};

const updatePatient = async (req, res, next) => {
  try {
    const patientId = req.params.id;
    const { name, email, phoneNumber } = req.body;

    if (!name || !email || !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "Name, email and phonenumber are required",
      });
    }

    const updatedPatient = await prisma.patient.update({
      where: { id: patientId },
      data: { name, email, phoneNumber },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return res.status(200).json({
      success: true,
      user: updatedPatient,
    });
  } catch (error) {
    console.error("Update user error:", error);
    next(error);
  }
};

const patientStats = async (req, res, next) => {
  try {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const patientsCount = await prisma.patient.count();
    const thisMonthPatients = await prisma.patient.count({
      where: {
        createdAt: {
          gte: firstDayOfMonth,
          lte: lastDayOfMonth,
        },
      },
    });

    res.status(200).json({
      message: "Stats retrevied successfully",
      data: {
        patientsCount,
        thisMonthPatients,
      },
    });
  } catch (error) {
    next(error);
  }
};

const patientsDelete = async (req, res, next) => {
  try {
    const { patientIds } = req.body;
    if (!patientIds || !Array.isArray(patientIds) || patientIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Patient IDs are required",
      });
    }

    await prisma.$transaction([
      prisma.patient.deleteMany({
        where: {
          id: {
            in: patientIds,
          },
        },
      }),
    ]);

    return res.status(200).json({
      success: true,
      message: "Patients deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

const updatePatientImage = async (req, res, next) => {
  try {
    const patientId = req.params.id;

    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded",
        success: false,
      });
    }

    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        message: "No user found",
        success: false,
      });
    }

    if (patient.image) {
      const oldImagePath = path.join(__dirname, "../public", patient.image);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    const imagePath = `/uploads/${req.file.filename}`;

    const updatedPatient = await prisma.patient.update({
      where: { id: patientId },
      data: { image: imagePath },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        phoneNumber: true,
      },
    });

    const formattedPatient = {
      ...updatedPatient,
      image: updatedPatient.image
        ? `${req.protocol}://${req.get("host")}${updatedPatient.image.replace(
          /\\/g,
          "/"
        )}`
        : null,
    };

    return res.status(200).json({
      success: true,
      data: formattedPatient,
      message: "Profile uploaded successfully",
    });
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};


module.exports = {
  getAllPatients,
  getPatientById,
  updatePatient,
  patientStats,
  patientsDelete,
  updatePatientImage
};
