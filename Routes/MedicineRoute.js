const express = require('express');
const router = express.Router();
const medicineController = require('../Controllers/MedicineController')
const {medicineValidation} = require("../Middlewares/medicineValidation");
const validationError = require("../Middlewares/errorValidator");
const authenticationMW = require("../Middlewares/authentication");

router.route("/medicine")
    .all(authenticationMW.checkAdminOrDoctor)
    .get(medicineController.getAllMedicines)
    .post(authenticationMW.checkAdmin, medicineValidation,validationError,medicineController.addMedicine); 

router.route("/medicine/:id")
    .all(authenticationMW.checkAdminOrDoctor)
    .get(medicineController.getMedicineByIdChild)
    .patch(authenticationMW.checkAdmin, medicineValidation,validationError,medicineController.updateMedicineById)
    .delete(authenticationMW.checkAdmin,medicineController.deleteMedicineById)

module.exports = router;