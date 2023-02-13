const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const saltRounds = 10;
const salt = bcrypt.genSaltSync(saltRounds);
const { updatePatient } = require("./patientController");
require("../Models/employeeModel");
const EmployeeSchema = mongoose.model("employees");
require("./../Models/clinicModel");
const ClinicSchema = mongoose.model("clinics");
require("../Models/usersModel")
const UserSchema = mongoose.model('users');


exports.get = (request, response, next) => {
   let reqQuery = { ...request.query };
   let querystr = JSON.stringify(reqQuery);
   querystr = querystr.replace(/\b(gt|gte|lt|lte|in)\b/g, (match) => `$${match}`);
   let query = EmployeeSchema.find(JSON.parse(querystr), { __v: 0 });
   if (request.query.select) {
      let selectFields = request.query.select.split(",").join(" ");
      query = query.select(selectFields);
   }
   if (request.query.sort) {
      let sortFields = request.query.sort.split(",").join(" ");
      query = query.sort(sortFields);
   }
   query
      .populate({
         path: "clinic",
         select: { location: 1, _id: 0 },
      })
      .then(function (data) {
         response.status(200).json(data);
      })
      .catch(function (error) {
         next(error);
      });
};

exports.getEmployeeByID = (request, response, next) => {
   if(request.id == request.params.id || request.role == "admin") {
      EmployeeSchema.findOne({ _id: request.params.id }, { __v: 0 })
         .populate({
            path: "clinic",
            select: { location: 1, _id: 0 },
         })
         .then((data) => {
            if (data) response.status(200).json(data);
            else next(new Error("employee doesn't exist"));
         })
         .catch((error) => next(error));
   }
   else {
      let error = new Error('Not allow for you to show the information of this employee');
      error.status = 403;
      next(error);
   }
};

exports.getEmployeeBySSN = (request, response, next) => {
   EmployeeSchema.findOne({ SSN: request.params.id }, { __v: 0 })
   .populate({
      path: "clinic",
      select: { location: 1, manager: 1, _id: 0 },
   })
   .then((data) => {
      if (data) {
         if(request.id == data._id || request.id == data.clinic.manager || request.role == "admin") {
            response.status(200).json(data);
         }
         else {
            let error = new Error('Not allow for you to show the information of this employee');
            error.status = 403;
            next(error);
         }
      }
      else 
      {
         next(new Error("employee doesn't exist"));
      }
   }).catch((error) => next(error));
};

exports.getEmployeesByClinicId = (request, response, next) => {
   EmployeeSchema.find({ clinic: request.params.id }, { __v: 0, password: 0 })
   .populate({
      path: "clinic",
      select: { manager: 1, _id: 0 },
   })
   .then((data) => {
      if (data.length > 0) {
         if(request.id == data.manager || request.role == "admin") {
            response.status(200).json(data);
         }
         else {
            let error = new Error('Not allow for you to show the information of this employee');
            error.status = 403;
            next(error);
         }
      }
      else {
         next(new Error("This clinic doesn't have any employees"));
      }
      })
      .catch((error) => next(error));
};

exports.add = (request, response, next) => {
   UserSchema.findOne({email: request.body.email}).then(function(data) {
      if(data == null) {
         ClinicSchema.findOne({ _id: request.body.clinic }, { _id: 1 }).then(function (data) {
            if (data != null) {
               const hash = bcrypt.hashSync(request.body.password, salt);
               let newEmployee = new EmployeeSchema({
                  _id: request.params.id,
                  SSN: request.body.SSN,
                  firstName: request.body.firstName,
                  lastName: request.body.lastName,
                  age: request.body.age,
                  address: request.body.address,
                  password: hash,
                  email: request.body.email,
                  phone: request.body.phone,
                  clinic: request.body.clinic,
               });
               if (request.file) {
                  newEmployee.image = request.file.path;
               }
               newEmployee
                  .save()
                  .then((result) => {
                     let newEmail = new UserSchema({
                        email: request.body.email,
                        password: request.body.password,
                        userId: result._id,
                        role: 'employee'
                     })
                     newEmail.save().then(function() {
                        response.status(200).json(result);
                     })
                  })
                  .catch((error) => next(error));
            } else {
               next(new Error("This clinic not found"));
            }
         });
      }
      else {
         next(new Error("This email is already used"))
      }
   }).catch(function(error) {
      next(error);
   })
};

exports.update = (request, response, next) => {
   if(request.id == request.params.id || request.role == "admin") {
      EmployeeSchema.findOne({_id: request.params.id}, {email: 1, password: 1, _id: 0}).then(function(data) {
         if(data != null) {
            let oldEmail = data.email;
            let oldPassword = data.password
            ClinicSchema.findOne({_id: request.body.clinic}, {_id: 1}).then(function(data) {
               if(data != null) {
                  let employeeData = {
                     SSN: request.body.SSN,
                     firstName: request.body.firstName,
                     lastName: request.body.lastName,
                     age: request.body.age,
                     address: request.body.address,
                     password: request.body.password,
                     email: request.body.email,
                     phone: request.body.phone,
                     clinic: request.body.clinic,
                  };
                  if (request.file) {
                     employeeData.image = request.file.path;
                  }
                  if(oldEmail == request.body.email.trim() && oldPassword == request.body.password.trim()) {
                     EmployeeSchema.updateOne(
                        { _id: request.params.id },
                        {
                           $set: employeeData,
                        }
                     )
                     .then((result) => {
                        if(result.modifiedCount == 0) {
                           response.status(200).json({Updated: true, Message: "Nothing is changed"});
                        }
                        else {
                           response.status(200).json({Updated: true, Message: "Employee is updated successfully"});
                        }
                     })
                     .catch((error) => next(error));
                  }
                  else {
                     UserSchema.updateOne(
                        {email: oldEmail}, 
                        {
                           $set: {
                              email: request.body.email,
                              password: request.body.password
                           }
                     }).then(function() {
                        EmployeeSchema.updateOne(
                           { _id: request.params.id },
                           {
                              $set: employeeData,
                           }
                        )
                        .then((result) => {
                           if(result.modifiedCount == 0) {
                              response.status(200).json({Updated: true, Message: "Nothing is changed"});
                           }
                           else {
                              response.status(200).json({Updated: true, Message: "Employee is updated successfully"});
                           }
                        })
                        .catch((error) => next(error));
                     }).catch(function() {
                        next(new Error("This email is already used"))
                     })
                  }
               }
               else {
                  next(new Error("This clinic not found"));
               }
            })
         }
         else {
            next(new Error("This Employee is not found"));
         }
      })
   }
   else {
      let error = new Error('Not allow for you to update the information of this employee');
      error.status = 403;
      next(error);
   }
};

exports.delete = (request, response, next) => {
   EmployeeSchema.findOne({_id: request.params.id}, {email: 1, _id: 0}).then(function(data) {
      UserSchema.deleteOne({email: data.email}).then(function() {
         EmployeeSchema
         .deleteOne({ _id: request.params.id })
         .then(() => {
            response.status(200).json({ message: "deleted" });
         })
         .catch((error) => next(error));
      })
   })
};