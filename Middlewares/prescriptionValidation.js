const {body} = require("express-validator");

exports.PrescriptionValidation = [
	body("clinic").isInt().withMessage("The clinic must be Integar"),
	body("doctor").isInt().withMessage("The doctor must be Integar"),
	body("patient").isInt().withMessage("The patient must be Integar"),
	body("medicine").optional().isArray().withMessage("The medicine must be array of objects"),
	body("medicine.*").isObject().withMessage("Any medicine must be object"),
    body("medicine.*.medicineId").isInt().withMessage("Id of any medicine must be Integar"),
    body("medicine.*.quantity").isLength({min: 5}).withMessage("quantity must be string with minimum characters equal 5"),
    body("medicine.*.medicineDosage").isLength({min: 5}).withMessage("The dosage of any medicine must be string with minimum characters equal to 5"),
	body("notes").isString().withMessage("The notes should be string")
]