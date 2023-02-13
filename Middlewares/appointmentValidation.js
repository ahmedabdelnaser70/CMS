const {body} = require("express-validator");

exports.appointmentValidation = [
	body("clinic").isNumeric().withMessage("clinic should be number"),
	body("doctor").isNumeric().withMessage("doctor should be number"),
	body("patient").isNumeric().withMessage("patient should be number"),
	body("date").matches(/^(0?[1-9]|[12][0-9]|3[01])[\/\-](0?[1-9]|1[012])[\/\-]\d{4}$/).withMessage("Date should be like 31/02/2023"),
	body("timeFrom").matches(/((1[0-2]|0?[1-9]):([0-5][0-9]) ?([AaPp][Mm]))/).withMessage('timeFrom must be like 8:30 am'),
	body("timeTo").matches(/((1[0-2]|0?[1-9]):([0-5][0-9]) ?([AaPp][Mm]))/).withMessage('timeTo must be like 8:30 am')
]