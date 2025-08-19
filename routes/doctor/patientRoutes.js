const express = require("express");
const router = express.Router();
const patientController = require("../../controllers/Patient/patientController");

router.get("/", patientController.getAllPatients);
router.delete("/", patientController.patientsDelete);
router.get("/stats", patientController.patientStats);
router.get("/:id", patientController.getPatientById);
router.put("/:id", patientController.updatePatient);

module.exports = router;
