const express = require("express");
const router = express.Router();
const controller = require("./../Controllers/clinicController");
const {ClinicValidation} = require("../Middlewares/clinicValidation");
const validationError = require("../Middlewares/errorValidator")
const authenticatioMW = require('../Middlewares/authentication');

router.route("/clinic")
	.all(authenticatioMW.checkAdmin)
	.get(controller.getAllClinic)
	.post(...ClinicValidation, validationError, controller.addClinic)

router.route("/clinic/:id?")
	.all(authenticatioMW.checkAdminOrDoctor)
	.get(controller.getClinicById)
	.patch(...ClinicValidation, validationError, controller.updateClinic)
	.delete(authenticatioMW.checkAdmin, controller.deleteClinic)

router.route("/clinic/services/:id?") // all users can see clinic services
	.get(controller.getClinicServices)

module.exports = router;