const { body, param } = require("express-validator");

let checkparamid = param("id").isInt().withMessage("Id should be integer");

let patientPost = [
   body("firstName")
      .isString()
      .withMessage("first Name should be string")
      .isLength({ min: 2 })
      .withMessage("length of first Name >2"),
   body("lastName")
      .isString()
      .withMessage("last Name should be string")
      .isLength({ min: 2 })
      .withMessage("length of last Name >2"),
   body("age").isInt().withMessage("age should be integer"),
   body("address").optional().isObject().withMessage("address should be object"),
   body("email").isEmail().withMessage("email should be valid"),
   body("password").isString().withMessage("password should be string"),
   body("phone").isString().withMessage("phone should be string"),
   body("image").optional().isString().withMessage("photo name must be string"),
];

let patientPatch = [
   body("firstName")
      .optional()
      .isString()
      .withMessage("first Name should be string")
      .isLength({ min: 2 })
      .withMessage("length of first Name >2"),
   body("lastName")
      .optional()
      .isString()
      .withMessage("last Name should be string")
      .isLength({ min: 2 })
      .withMessage("length of last Name >2"),
   body("age").optional().isInt({ min: 1 }).withMessage("age should be integer and min age = 1"),
   body("address").optional().isObject().withMessage("address should be object"),
   body("address.city").optional().isString().withMessage("city should be a string"),
   body("address.street").optional().isString().withMessage("street should be a string"),
   body("address.building").optional().isInt().withMessage("building should be a integer"),
   body("emali").optional().isEmail().withMessage("email should be valid"),
   body("password").optional().isString().withMessage("password should be string"),
   body("phone").optional().isString().withMessage("phone should be string"),
   body("image").optional().isString().withMessage("photo name must be string"),
];

module.exports = { patientPost, patientPatch, checkparamid };
