const express = require("express");
const router = express.Router();
const upload = require("../../utils/upload");

const doctorController = require("../../controllers/Doctor/doctorController");
const checkPermission = require('../../middleware/checkPermission')

router.get("/", checkPermission("VIEW_DOCTORS"), doctorController.getAllDoctors);
router.delete("/", checkPermission("DELETE_DOCTORS"), doctorController.deleteDoctorWithAvailability);
router.get("/stats", checkPermission("VIEW_DOCTORS"), doctorController.getDoctorStats);
router.get("/:id", checkPermission("VIEW_DOCTORS"), doctorController.getSingleDoctor);
router.put("/:id", checkPermission("VIEW_PROFILE"), doctorController.updatedSingleDoctor);
router.put("/status/:id", checkPermission("EDIT_DOCTORS"), doctorController.updateDoctorStatus);
router.post("/availability", checkPermission("VIEW_PROFILE"), doctorController.doctorAvability);
router.put("/availability/:id", checkPermission("VIEW_PROFILE"), doctorController.updateDoctorAvailability);
router.delete("/availability", checkPermission("VIEW_PROFILE"), doctorController.deleteAvailabilities);
router.post(
  "/:id/upload-image",
  upload.single("image"),
  checkPermission("VIEW_PROFILE"),
  doctorController.uploadDoctorImage
);

module.exports = router;
