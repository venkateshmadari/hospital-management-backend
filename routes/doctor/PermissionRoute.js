const express = require("express");
const router = express.Router();
const permissionController = require("../../controllers/Doctor/permissionController")
const checkPermission = require('../../middleware/checkPermission')

router.get("/all", checkPermission("VIEW_ALL_PERMISSIONS"), permissionController.getAllPermissions)
router.post("/:id/permissions", checkPermission("EDIT_PERMISSIONS"), permissionController.giveDoctorPermissions)

module.exports = router;