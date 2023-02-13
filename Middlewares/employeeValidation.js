const { body, param } = require("express-validator");

let checkParamid = param("id").isInt().withMessage("Id should be integer");
let employeePost = [
   body("SSN")
      .matches(/[0-9]{14}/)
      .withMessage("SSN should 14 Number"),
   body("firstName")
      .isString()
      .withMessage("first name should string")
      .isLength({ min: 3, max: 20 })
      .withMessage("lenght of name should be larger than 2 and lower than 21"),
   body("lastName")
      .isString()
      .withMessage("last name should string")
      .isLength({ min: 3, max: 20 })
      .withMessage("lenght of name should be larger than 2 and lower than 21"),
   body("age").isInt().withMessage("age should be integer"),
   body("address").isObject().withMessage("address should be object"),
   body("password").isLength({ min: 8 }).withMessage("length must be >= 8"),
   body("email").isEmail().withMessage("Invalid email"),
   body("phone").isString().withMessage("Invalid phone number"),
   body("image").optional().isString().withMessage("image name must be string"),
   body("clinic").isInt().withMessage("clinic Id name must be integar"),
];

let employeePatch = [
   body("SSN")
      .matches(/[0-9]{14}/)
      .withMessage("SSN should 14 Number"),
   body("firstName")
      .optional()
      .isString()
      .withMessage("first name should string")
      .isLength({ min: 3, max: 20 })
      .withMessage("name lenght  should be > 2 and l< 21"),
   body("lastName")
      .optional()
      .isString()
      .withMessage("last name should string")
      .isLength({ min: 3, max: 20 })
      .withMessage("name lenght  should be > 2 and l< 21"),
   body("age").isInt().withMessage("age should be integer"),
   body("address").isObject().withMessage("address should be object"),
   body("password").optional().isLength({ min: 8 }).withMessage("length must be >= 8"),
   body("email").optional().isEmail().withMessage("Invalid email"),
   body("phone").optional().isString().withMessage("Invalid phone number"),
   body("image").optional().isString().withMessage("image name must be string"),
   body("clinic").isInt().withMessage("clinic Id name must be integar"),
];

module.exports = { employeePost, employeePatch, checkParamid };
