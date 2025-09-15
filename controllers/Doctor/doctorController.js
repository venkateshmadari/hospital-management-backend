const prisma = require("../../utils/prisma");
const fs = require("fs");
const path = require("path");
const validateTimes = require("../../utils/validateTimes");

const getAllDoctors = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search = "", status, speciality } = req.query;
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const where = {
      email: {
        not: "admin@gmail.com",
      },
    };
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { speciality: { contains: search } },
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

    const formattedDoctors = allDoctors.map((doctor) => ({
      ...doctor,
      image: doctor.image
        ? `${req.protocol}://${req.get("host")}${doctor.image.replace(
          /\\/g,
          "/"
        )}`
        : null,
    }));

    const totalDoctors = await prisma.doctors.count({ where });

    const totalPages = Math.ceil(totalDoctors / limitNumber);

    return res.status(200).json({
      status: "success",
      data: formattedDoctors,
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

const getDoctorStats = async (req, res, next) => {
  try {
    const totalDoctors = await prisma.doctors.count({
      where: {
        email: {
          not: "admin@gmail.com",
        },
      },
    });
    const activeDoctors = await prisma.doctors.count({
      where: {
        status: "ACTIVE",
        email: {
          not: "admin@gmail.com",
        },
      },
    });
    const inActiveDoctors = await prisma.doctors.count({
      where: {
        status: "INACTIVE",
        email: {
          not: "admin@gmail.com",
        },
      },
    });
    return res.status(200).json({
      status: "success",
      data: {
        totalDoctors,
        activeDoctors,
        inActiveDoctors,
      },
    });
  } catch (error) {
    next(error);
  }
};

const uploadDoctorImage = async (req, res, next) => {
  try {
    const doctorId = req.params.id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const doctor = await prisma.doctors.findUnique({
      where: { id: doctorId },
    });

    if (!doctor) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    if (doctor.image) {
      const oldImagePath = path.join(__dirname, "../public", doctor.image);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    const imagePath = `/uploads/${req.file.filename}`;

    const updatedDoctor = await prisma.doctors.update({
      where: { id: doctorId },
      data: { image: imagePath },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    });

    return res.status(200).json({
      success: true,
      data: updatedDoctor,
      message: "Doctor image uploaded successfully",
    });
  } catch (error) {
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
        status: true,
        designation: true,
        image: true,
        createdAt: true,
        speciality: true,
        description: true,
        Avability: true,
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
        ? `${req.protocol}://${req.get("host")}${doctor.image.replace(
          /\\/g,
          "/"
        )}`
        : null,
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
    const { name, email, designation, speciality, description } = req.body;
    const doctorId = req.params.id;

    const updatedDoctor = await prisma.doctors.update({
      where: { id: doctorId },
      data: {
        name,
        email,
        designation,
        speciality,
        description,
      },
      select: {
        id: true,
        name: true,
        email: true,
        designation: true,
        speciality: true,
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

const updateDoctorStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const doctorId = req.params.id;
    const allowedStatuses = ["ACTIVE", "INACTIVE"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values are: ${allowedStatuses.join(", ")}`,
      });
    }

    const findDoctor = await prisma.doctors.findUnique({
      where: { id: doctorId },
    });

    if (!findDoctor) {
      return res.status(404).json({
        success: false,
        message: `Doctor not found with id of ${doctorId}`,
      });
    }

    // 🔑 Detect transition from INACTIVE → ACTIVE
    const isActivating = findDoctor.status === "INACTIVE" && status === "ACTIVE";

    const updatedDoctor = await prisma.doctors.update({
      where: { id: doctorId },
      data: { status },
      select: {
        id: true,
        name: true,
        status: true,
      },
    });

    // ✅ Assign default permissions if activating
    if (isActivating) {
      const defaultDoctorPerms = [
        "VIEW_PROFILE",
        "VIEW_APPOINTMENTS",
        "EDIT_APPOINTMENTS",
        "DELETE_APPOINTMENTS",
      ];

      for (const permName of defaultDoctorPerms) {
        const perm = await prisma.permissions.findUnique({
          where: { name: permName },
        });

        if (perm) {
          await prisma.doctorPermissions.upsert({
            where: {
              doctorId_permissionId: {
                doctorId: doctorId,
                permissionId: perm.id,
              },
            },
            update: {},
            create: {
              doctorId: doctorId,
              permissionId: perm.id,
            },
          });
        }
      }
    }

    return res.status(200).json({
      success: true,
      data: updatedDoctor,
      message: isActivating
        ? "Doctor activated and default permissions assigned"
        : "Doctor status updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

const doctorAvability = async (req, res, next) => {
  try {
    const { doctorId, availabilites } = req.body;

    if (
      !doctorId ||
      !Array.isArray(availabilites) ||
      availabilites.length === 0
    ) {
      return res
        .status(400)
        .json({ error: "doctorId and availabilites are required" });
    }

    const validDays = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];

    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

    for (const avail of availabilites) {
      if (!validDays.includes(avail.day)) {
        return res.status(400).json({ error: `Invalid day: ${avail.day}` });
      }

      if (
        !avail.startTime ||
        !avail.endTime ||
        !avail.breakStartTime ||
        !avail.breakEndTime
      ) {
        return res.status(400).json({
          error:
            "startTime, endTime, breakStartTime, breakEndTime are required",
        });
      }

      if (
        !timeRegex.test(avail.startTime) ||
        !timeRegex.test(avail.endTime) ||
        !timeRegex.test(avail.breakStartTime) ||
        !timeRegex.test(avail.breakEndTime)
      ) {
        return res
          .status(400)
          .json({ error: "Invalid time format. Use HH:mm" });
      }

      const errorMsg = validateTimes(
        avail.startTime,
        avail.endTime,
        avail.breakStartTime,
        avail.breakEndTime
      );
      if (errorMsg) {
        return res.status(400).json({ error: errorMsg });
      }
    }

    const created = await prisma.$transaction(
      availabilites.map((a) =>
        prisma.availability.create({
          data: {
            doctorId,
            day: a.day,
            startTime: a.startTime,
            endTime: a.endTime,
            breakStartTime: a.breakStartTime,
            breakEndTime: a.breakEndTime,
          },
        })
      )
    );

    return res.status(201).json({
      message: "Availability created successfully",
      data: created,
    });
  } catch (error) {
    next(error);
  }
};

const updateDoctorAvailability = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { startTime, endTime, breakStartTime, breakEndTime, day } = req.body;

    if (
      !id ||
      !day ||
      !startTime ||
      !endTime ||
      !breakStartTime ||
      !breakEndTime
    ) {
      return res.status(400).json({
        error:
          "id, day, startTime, endTime, breakStartTime, breakEndTime are required",
      });
    }

    const validDays = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];

    const formattedDay =
      day.charAt(0).toUpperCase() + day.slice(1).toLowerCase();

    if (!validDays.includes(formattedDay)) {
      return res.status(400).json({ error: `Invalid day: ${day}` });
    }
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (
      !timeRegex.test(startTime) ||
      !timeRegex.test(endTime) ||
      !timeRegex.test(breakStartTime) ||
      !timeRegex.test(breakEndTime)
    ) {
      return res.status(400).json({ error: "Invalid time format. Use HH:mm" });
    }

    const errorMsg = validateTimes(
      startTime,
      endTime,
      breakStartTime,
      breakEndTime
    );
    if (errorMsg) {
      return res.status(400).json({ error: errorMsg });
    }

    const existing = await prisma.availability.findUnique({
      where: { id: id },
    });

    if (!existing) {
      return res.status(404).json({ error: "Availability not found" });
    }

    const updated = await prisma.availability.update({
      where: { id: id },
      data: {
        day: formattedDay,
        startTime,
        endTime,
        breakStartTime,
        breakEndTime,
      },
    });

    return res.status(200).json({
      message: "Availability updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Error updating availability:", error);
    next(error);
  }
};

const deleteAvailabilities = async (req, res, next) => {
  try {
    const { availabilityIds } = req.body;
    if (
      !availabilityIds ||
      !Array.isArray(availabilityIds) ||
      availabilityIds.length === 0
    ) {
      return res.status(400).json({
        error: "availabilityIds array is required",
      });
    }

    const result = await prisma.$transaction([
      prisma.availability.deleteMany({
        where: {
          id: {
            in: availabilityIds,
          },
        },
      }),
    ]);

    return res.status(200).json({
      message: "Availabilities deleted successfully",
      data: {
        count: result[0].count,
      },
    });
  } catch (error) {
    console.error("Error deleting availabilities:", error);
    next(error);
  }
};

const deleteDoctorWithAvailability = async (req, res, next) => {
  try {
    const { doctorIds } = req.body;
    if (!doctorIds || !Array.isArray(doctorIds) || doctorIds.length === 0) {
      return res.status(400).json({
        error: "doctorIds array is required",
      });
    }
    const existingDoctors = await prisma.doctors.findMany({
      where: {
        id: {
          in: doctorIds,
        },
      },
      select: {
        id: true,
      },
    });
    const existingDoctorIds = existingDoctors.map((doctor) => doctor.id);
    const nonExistingDoctorIds = doctorIds.filter(
      (id) => !existingDoctorIds.includes(id)
    );
    if (nonExistingDoctorIds.length > 0) {
      return res.status(404).json({
        success: false,
        error: "Some doctor IDs not found",
        nonExistingIds,
        existingDoctorIds,
      });
    }

    const [availabilityResult, doctorResult] = await prisma.$transaction([
      prisma.availability.deleteMany({
        where: {
          doctorId: {
            in: doctorIds,
          },
        },
      }),
      prisma.doctors.deleteMany({
        where: {
          id: {
            in: doctorIds,
          },
        },
      }),
    ]);
    return res.status(200).json({
      success: true,
      message: `Successfully deleted ${doctorResult.count} doctor(s) and ${availabilityResult.count} availability records`,
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
  updateDoctorAvailability,
  deleteAvailabilities,
  deleteDoctorWithAvailability,
  updateDoctorStatus,
};
