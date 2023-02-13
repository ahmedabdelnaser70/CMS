const express = require('express');
const router = express.Router();
const reportController = require('../Controllers/reportController')
const authenticationMW = require("../Middlewares/authentication");

router.route("/report/appointment")
    .get(authenticationMW.checkAdmin, reportController.getAllAppointments); 

//----------------------------------Appointment routes for daily report-----------------------------

router.route("/report/appointment/daily")
    .get(authenticationMW.checkAdmin, reportController.getDailyAppointmentReport)

router.route("/report/appointment/daily/clinic/:id")
    .get(authenticationMW.checkAdminOrDoctor, reportController.getClinicDailyAppointmentReport)

router.route("/report/appointment/daily/doctor/:id")
    .get(authenticationMW.checkAdminOrDoctor, reportController.getDoctorDailyAppointmentReport)

router.route("/report/appointment/daily/patient/:id")
    .get(authenticationMW.checkAdminOrPatient, reportController.getPatientDailyAppointmentReport)


//----------------------- Appointment routes for a specific Day report -------------------------------------

router.route("/report/appointment/day")
    .get(authenticationMW.checkAdmin, reportController.getAppointmentReportForaDay)

router.route("/report/appointment/day/clinic/:id")
    .get(authenticationMW.checkAdminOrDoctor, reportController.getClinicAppointmentReportForaDay)

router.route("/report/appointment/day/doctor/:id")
    .get(authenticationMW.checkAdminOrDoctor, reportController.getDoctorAppointmentReportForaDay)

router.route("/report/appointment/day/patient/:id")
    .get(authenticationMW.checkAdminOrPatient, reportController.getPatientAppointmentReportForaDay)


//----------------------- Invoices daily report routes --------------------

router.route("/report/invoice/daily")
    .get(authenticationMW.checkAdmin, reportController.getDailyInvoicesReport)

    
router.route("/report/invoice/daily/clinic/:id")
    .get(authenticationMW.checkAdminOrDoctor, reportController.getClinicDailyInvoicesReport)

    

router.route("/report/invoice/daily/patient/:id")
    .get(authenticationMW.checkAdminOrPatient, reportController.getPatientDailyInvoicesReport)

//-------------------------- invoices report for specific day 

router.route("/report/invoice/day")
    .get(authenticationMW.checkAdmin, reportController.getInvoicesReportForaDay)

router.route("/report/invoice/day/clinic/:id")
    .get(authenticationMW.checkAdminOrDoctor, reportController.getClinicInvoicesReportForaDay)

router.route("/report/invoice/day/patient/:id")
    .get(authenticationMW.checkAdminOrPatient, reportController.getPatientInvoicesReportForaDay)


module.exports = router;