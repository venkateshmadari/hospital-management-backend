const express = require("express");
const router = express.Router();
const upload = require("../utils/upload");

const doctorController = require("../controllers/doctorController");

router.get("/", doctorController.getAllDoctors);
router.delete("/", doctorController.deleteDoctorWithAvailability);
router.get("/stats", doctorController.getDoctorStats);
router.get("/:id", doctorController.getSingleDoctor);
router.put("/:id", doctorController.updatedSingleDoctor);
router.put("/status/:id", doctorController.updateDoctorStatus);
router.post("/availability", doctorController.doctorAvability);
router.put("/availability/:id", doctorController.updateDoctorAvailability);
router.delete("/availability", doctorController.deleteAvailabilities);
router.post(
  "/:id/upload-image",
  upload.single("image"),
  doctorController.uploadDoctorImage
);

module.exports = router;
