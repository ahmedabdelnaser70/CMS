const express = require("express");
const router = express.Router();
const controller = require("../Controllers/doctorController");
const validator = require("../Middlewares/errorValidator");
const { DoctorValidation } = require("../Middlewares/doctorValidation");
const { upload } = require("../Middlewares/uploadImage");
const authenticatioMW = require('../Middlewares/authentication');

router
   .route("/doctor")
   .all(authenticatioMW.checkAdmin)
   .get(controller.getAllDoctors)
   .post(upload, ...DoctorValidation, validator, controller.addDoctor);

router
   .route("/doctor/:id?")
   .all(authenticatioMW.checkAdminOrDoctor)
   .get(controller.getDoctorById)
   .patch(upload, ...DoctorValidation, controller.updateDoctorById)
   .delete(authenticatioMW.checkAdmin, controller.deleteDoctorById);

module.exports = router;
