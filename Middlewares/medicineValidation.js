const {body} = require("express-validator");

exports.medicineValidation = [
	body("name").isString().withMessage("name should be alphabitic"),
	body("description").isString().withMessage("description should be string")
]
