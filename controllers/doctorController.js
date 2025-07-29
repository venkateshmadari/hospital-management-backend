const prisma = require("../utils/prisma");

const getAllDoctors = async (req, res, next) => {
  try {
    const allDoctors = await prisma.doctors.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        designation: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({
      status: "success",
      data: allDoctors,
    });
  } catch (error) {
    next(error);
  }
};

const getSingleDoctor = async (req, res, next) => {
  try {
    const id = req.params.id;
    const doctor = await prisma.doctors.findUnique({
      where: { id },
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
        message: "Doctor not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: doctor,
    });
  } catch (error) {
    next(error);
  }
};

const updatedSingleDoctor = async (req, res, next) => {
  try {
    const { name, email, designation } = req.body;
    const doctorId = req.params.id;

    const updatedDoctor = await prisma.doctors.update({
      where: { id: doctorId },
      data: {
        name,
        email,
        designation,
      },
      select: {
        id: true,
        name: true,
        email: true,
        designation: true,
        createdAt: true,
      },
    });

    return res.status(200).json({
      success: true,
      data: updatedDoctor,
      message: "Doctor data updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllDoctors,
  getSingleDoctor,
  updatedSingleDoctor,
};
