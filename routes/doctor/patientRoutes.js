const express = require("express");
const router = express.Router();
const patientController = require("../../controllers/Patient/patientController");
const checkPermission = require('../../middleware/checkPermission')

router.get("/", checkPermission("VIEW_PATIENTS"), patientController.getAllPatients);
router.delete("/", checkPermission("DELETE_PATIENTS"), patientController.patientsDelete);
router.get("/stats", checkPermission("VIEW_PATIENTS"), patientController.patientStats);
router.get("/:id", checkPermission("VIEW_PATIENTS"), patientController.getPatientById);
router.put("/:id", checkPermission("EDIT_PATIENTS"), patientController.updatePatient);

module.exports = router;
