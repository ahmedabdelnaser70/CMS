const { body, param } = require("express-validator");

let checkParamid = param("id").isInt().withMessage("Id should be integer");
let invoicePost = [
   body("clinicId").isInt().withMessage("clinicId should be integer"),
   body("patientId").isInt().withMessage("patientId should be integer"),
   body("services").isArray().withMessage("services shoud be array"),
   body("services.*").isObject().withMessage("services name must be object"),
   body("services.*.doctorId").isInt().withMessage("doctorId must be int"),
   body("services.*.price").isNumeric().withMessage("price  must be number"),
];

let invoicePatch = [
   body("clinicId").isInt().withMessage("clinicId should be integer"),
   body("patientId").isInt().withMessage("patientId should be integer"),
   body("services").isArray().withMessage("services shoud be array"),
   body("services.*").isObject().withMessage("services name must be object"),
   body("services.*.doctorId").isInt().withMessage("doctorId must be int"),
   body("services.*.price").isNumeric().withMessage("price  must be number"),
];

module.exports = { invoicePost, invoicePatch, checkParamid };
