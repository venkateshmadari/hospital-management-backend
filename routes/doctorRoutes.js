const express = require("express");
const router = express.Router();
const upload = require("../utils/upload");

const doctorController = require("../controllers/doctorController");

router.get("/", doctorController.getAllDoctors);
router.get("/stats", doctorController.getDoctorStats);
router.get("/:id", doctorController.getSingleDoctor);
router.put("/:id", doctorController.updatedSingleDoctor);
router.post("/availability", doctorController.doctorAvability)
router.put("/availability", doctorController.updateDoctorAvailability)
router.post(
    "/:id/upload-image",
    upload.single('image'),
    doctorController.uploadDoctorImage
);

module.exports = router;
