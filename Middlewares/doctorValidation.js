const { body } = require("express-validator");

exports.DoctorValidation = [
   body("firstName")
      .isAlpha()
      .withMessage("first name must be alpha")
      .isLength({ max: 50 })
      .withMessage("first name characters must be <= 50"),
   body("lastName")
      .isAlpha()
      .withMessage("last name must be alpha")
      .isLength({ max: 50 })
      .withMessage("last name characters must be <= 50"),
   body("age").isInt().withMessage("doctor age must be number"),
   body("email")
      .matches(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)
      .withMessage("enter valid email"),
   body("password").isString().isLength({ min: 5 }).withMessage("password minimun length must be >= 5"),
   body("address").isObject().withMessage("address must be object"),
   body("address.city").isString().withMessage("city must be string with characters <= 20"),
   body("address.street").isString().withMessage("street must be number"),
   body("address.building").isInt().withMessage("building must be number"),
   body("image").optional().isString().withMessage("photo name must be string"),
   body("phone")
      .matches(/^01[0125][0-9]{8}$/)
      .withMessage("enter valid phone number"),
   body("clinic").isArray().withMessage("The clinic must be array"),
   body("clinic").notEmpty().withMessage("The clinic must be not empty"),
   body("clinic.*").isInt().withMessage("Id of any clinic must be number"),
   body("specialty").isString().withMessage("specialty must be a string"),
];
