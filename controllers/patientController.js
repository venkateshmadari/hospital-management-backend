const prisma = require("../utils/prisma");

const getAllPatients = async (req, res, next) => {
  try {
    const patients = await prisma.patient.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({
      success: true,
      count: patients.length,
      data: patients,
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
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Name and email are required",
      });
    }

    const updatedPatient = await prisma.patient.update({
      where: { id: patientId },
      data: { name, email },
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

module.exports = {
  getAllPatients,
  getPatientById,
  updatePatient,
};
