const route = require("express").Router();
const {
  updatePatient,
} = require("../../controllers/Patient/patientController");

route.put("/:id", updatePatient);

module.exports = route;
