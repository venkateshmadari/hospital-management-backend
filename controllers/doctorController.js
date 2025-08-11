const prisma = require("../utils/prisma");
const fs = require('fs');
const path = require('path');

const getAllDoctors = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search = "", status, speciality } = req.query;
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ];
    }

    if (status) {
      where.status = status;
    }
    if (speciality) {
      where.speciality = speciality;
    }

    const allDoctors = await prisma.doctors.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        designation: true,
        status: true,
        image: true,
        speciality: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limitNumber,
    });

    const totalDoctors = await prisma.doctors.count({ where });

    const totalPages = Math.ceil(totalDoctors / limitNumber);

    return res.status(200).json({
      status: "success",
      data: allDoctors,
      pagination: {
        totalItems: totalDoctors,
        totalPages,
        currentPage: pageNumber,
        itemsPerPage: limitNumber,
        hasNextPage: pageNumber < totalPages,
        hasPreviousPage: pageNumber > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getDoctorStats = async () => {
  try {
    const totalDoctors = await prisma.doctors.count()
    const activeDoctors = await prisma.doctors.count({
      where: {
        status: "ACTIVE"
      }
    })
    const inActiveDoctors = await prisma.doctors.count({
      where: {
        status: "INACTIVE"
      }
    })
    return res.status(200).json({
      status: "success",
      data: {
        totalDoctors,
        activeDoctors,
        inActiveDoctors
      }
    })
  } catch (error) {
    next(error)
  }
}

const uploadDoctorImage = async (req, res, next) => {
  try {
    const doctorId = req.params.id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }

    const doctor = await prisma.doctors.findUnique({
      where: { id: doctorId }
    });

    if (!doctor) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({
        success: false,
        message: "Doctor not found"
      });
    }

    if (doctor.image) {
      const oldImagePath = path.join(__dirname, '../public', doctor.image);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    const imagePath = path.join('uploads', req.file.filename);

    const updatedDoctor = await prisma.doctors.update({
      where: { id: doctorId },
      data: { image: imagePath },
      select: {
        id: true,
        name: true,
        email: true,
        image: true
      }
    });

    return res.status(200).json({
      success: true,
      data: updatedDoctor,
      message: "Doctor image uploaded successfully"
    });
  } catch (error) {
    // Clean up uploaded file if error occurs
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
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
        image: true,
        createdAt: true,
        specialty: true,
        description: true,
        Avability: true
      },
    });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    const formattedDoctor = {
      ...doctor,
      image: doctor.image
        ? `${req.protocol}://${req.get('host')}/public/${doctor.image.replace(/\\/g, '/')}`
        : null
    };

    return res.status(200).json({
      success: true,
      data: formattedDoctor,
    });
  } catch (error) {
    next(error);
  }
};

const updatedSingleDoctor = async (req, res, next) => {
  try {
    const { name, email, designation, specialty, description } = req.body;
    const doctorId = req.params.id;

    const updatedDoctor = await prisma.doctors.update({
      where: { id: doctorId },
      data: {
        name,
        email,
        designation,
        specialty,
        description,
      },
      select: {
        id: true,
        name: true,
        email: true,
        designation: true,
        specialty: true,
        description: true,
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

const doctorAvability = async (req, res, next) => {
  const { doctorId, availabilites } = req.body;
  if (!doctorId) {
    return res.status(400).json({
      error: "doctorId is missing"
    })
  }
  if (!Array.isArray(availabilites) || availabilites.length === 0) {
    return res.status(400).json({
      error: "Availabilites are not in array"
    })
  }

  const validDays = ["Monday", "Tuesday", "Wednesday", "Thrusday", "Friday", "Saturday", "Sunday"]

  for (const availbility of availabilites) {
    if (!validDays.includes(availbility.day)) {
      return res.status(400).json({ error: `Invalid day: ${availbility.day}` })
    }
    if (!availbility.startTime || !availbility.endTime || !availbility.breakStartTime || !availbility.breakEndTime) {
      return res.status(400).json({ error: "startTime, endTime, breakStartTime ,breakEndTime are missing" })
    }
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

    if (
      !timeRegex.test(availbility.startTime) ||
      !timeRegex.test(availbility.endTime) ||
      !timeRegex.test(availbility.breakStartTime) ||
      !timeRegex.test(availbility.breakEndTime)
    ) {
      return res.status(400).json({ error: 'Invalid time format. Use HH:mm' });
    }
  }
  try {
    const doctor = prisma.doctors.findUnique({
      where: {
        id: doctorId
      }
    })

    if (!doctor) {
      return res.status(404).json({
        message: `No doctor found with ${doctorId}`
      })
    }

    const existingDays = await prisma.availability.findMany({
      where: {
        doctorId,
        day: { in: availabilites.map(a => a.day) }
      },
      select: { day: true }
    })

    if (existingDays.length > 0) {
      const duplicateDays = existingDays.map(d => d.day);
      return res.status(409).json({ error: `Availability already exists for days: ${duplicateDays.join(', ')}` });
    }

    await prisma.availability.createMany({
      data:
        availabilites.map(avail => ({
          doctorId: doctorId,
          day: avail.day,
          startTime: avail.startTime,
          endTime: avail.endTime,
          breakStartTime: avail.breakStartTime,
          breakEndTime: avail.breakEndTime
        }))
    })

    const newAvailabilities = await prisma.availability.findMany({
      where: {
        doctorId,
        day: {
          in: availabilites.map(a => a.day)
        }
      }
    })

    return res.status(201).json({ data: newAvailabilities })
  }
  catch (error) {
    next(error)
  }
}

const updateDoctorAvailability = async (req, res, next) => {
  try {
    const { doctorId, day, startTime, endTime, breakStartTime, breakEndTime } = req.body;

    if (!doctorId || !day) {
      return res.status(400).json({ error: "doctorId and day are required" });
    }

    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!startTime || !timeRegex.test(startTime)) {
      return res.status(400).json({ error: "Invalid or missing startTime" });
    }
    if (!endTime || !timeRegex.test(endTime)) {
      return res.status(400).json({ error: "Invalid or missing endTime" });
    }
    if (!breakStartTime || !timeRegex.test(breakStartTime)) {
      return res.status(400).json({ error: "Invalid or missing breakStartTime" });
    }
    if (!breakEndTime || !timeRegex.test(breakEndTime)) {
      return res.status(400).json({ error: "Invalid or missing breakEndTime" });
    }

    const doctor = await prisma.doctors.findUnique({
      where: { id: doctorId }
    });

    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    const existing = await prisma.availability.findFirst({
      where: {
        doctorId,
        day,
      },
    });

    if (!existing) {
      return res.status(404).json({
        error: `No availability found for doctor ${doctorId} on ${day}`,
      });
    }

    const updated = await prisma.availability.update({
      where: {
        id: existing.id,
      },
      data: {
        startTime,
        endTime,
        breakStartTime,
        breakEndTime,
        updatedAt: new Date()
      },
    });

    return res.status(200).json({
      message: "Doctor availability updated successfully",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};


module.exports = {
  getAllDoctors,
  getDoctorStats,
  uploadDoctorImage,
  getSingleDoctor,
  updatedSingleDoctor,
  doctorAvability,
  updateDoctorAvailability
};
