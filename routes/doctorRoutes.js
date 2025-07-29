const express = require("express");
const router = express.Router();

const doctorController = require("../controllers/doctorController");

router.get("/", doctorController.getAllDoctors);
router.get("/:id", doctorController.getSingleDoctor);
router.put("/:id", doctorController.updatedSingleDoctor);

module.exports = router;
