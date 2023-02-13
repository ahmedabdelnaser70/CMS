const express = require("express");
const router = express.Router();
const controller = require("./../Controllers/presciptionController");
const {PrescriptionValidation} = require("../Middlewares/prescriptionValidation");
const validationError = require("../Middlewares/errorValidator")
const authenticatioMW = require("../Middlewares/authentication")

router.route("/presciption")
	.get(authenticatioMW.checkAdmin, controller.getAllPresciptions)// admin
	.post(authenticatioMW.checkAdminOrDoctor, ...PrescriptionValidation, validationError, controller.addPresciption) //admin & doctor

router.route("/presciption/:id?")
	.all(authenticatioMW.checkAdminOrDoctor)
	.get(controller.getPresciptionById) //admin
	.patch(...PrescriptionValidation, validationError, controller.updatePresciption) //admin & doctor
	.delete(controller.deletePresciption) //admin&doctor

router.route("/presciption/clinic/:id?")
	.get(authenticatioMW.checkAdminOrDoctor, controller.getPresciptionsByClinicId) //admin & manager

router.route("/presciption/doctor/:id?")
	.get(authenticatioMW.checkAdminOrDoctor, controller.getPresciptionsByDoctorId) //admin & doctor
	
router.route("/presciption/patient/:id?")
	.get(authenticatioMW.checkAdminOrPatient, controller.getPresciptionsByPatientId) //admin & patient

module.exports = router;
