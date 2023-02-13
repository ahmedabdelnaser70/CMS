const express = require('express');
const router = express.Router();
const controller = require('../Controllers/appointmentController');
const validator = require('../Middlewares/errorValidator');
const { appointmentValidation } = require("../Middlewares/appointmentValidation");
const authenticationMW = require("../Middlewares/authentication");

router.route('/appointment')
    .all(authenticationMW.checkAdmin)
    .get(controller.getAllAppointments)
    .post(...appointmentValidation, validator, controller.addAppointment)

router.route('/appointment/:id?')
    .all(authenticationMW.checkAdmin)
    .get(controller.getAppointmentById)
    .patch(...appointmentValidation, validator, controller.updateAppointmentById)
    .delete(controller.deleteAppointmentById)

router.route("/appointment/clinic/:id?")
    .all(authenticationMW.checkAdminOrEmployee)
    .get(controller.getappointmentsByClinicId);

router.route("/appointment/doctor/:id?")
    .all(authenticationMW.checkAdminOrDoctor)
    .get(controller.getappointmentsByDoctorId);

router.route("/appointment/patient/:id?")
    .all(authenticationMW.checkAdminOrPatient)
    .get(controller.getappointmentsByPatientId);


module.exports = router;