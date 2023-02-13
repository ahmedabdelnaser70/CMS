const {body} = require("express-validator");

exports.ClinicValidation = [
	body("location").isObject().withMessage("Location should be Object"),
	body("location.city").isAlpha().withMessage("City should be alphabitic"),
	body("location.street").isString().withMessage("Street should be string"),
	body("location.building").isInt().withMessage("Building Should be number"),
	body("mobilePhone").matches(/^01[0125][0-9]{8}$/).withMessage("Invalid Mobile Phone"),
	body("doctors").optional().isArray().withMessage("The doctors must be array"),
	body("doctors.*").isNumeric().withMessage("Id of any doctor must be number"),
	body("manager").optional().isInt().withMessage("Manager Id should be Intergar")
]