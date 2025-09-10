const route = require("express").Router();
const {
  updatePatient,
  updatePatientImage
} = require("../../controllers/Patient/patientController");
const upload = require("../../utils/upload");

route.put("/:id", updatePatient);
route.post(
  "/:id/upload-image",
  upload.single("image"),
  updatePatientImage
);

module.exports = route;
