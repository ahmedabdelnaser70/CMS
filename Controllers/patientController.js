const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const saltRounds = 10;
const salt = bcrypt.genSaltSync(saltRounds);
require("../Models/patientModel");
const patientSchema = mongoose.model("patients");
require("../Models/usersModel")
const UserSchema = mongoose.model('users');

// get all patient
exports.getAllPatient = (request, response, next) => {
   let reqQuery = { ...request.query };
   let querystr = JSON.stringify(reqQuery);
   querystr = querystr.replace(/\b(gt|gte|lt|lte|in)\b/g, (match) => `$${match}`);

   let query = patientSchema.find(JSON.parse(querystr));

   //Select Fields
   if (request.query.select) {
      let selectFields = request.query.select.split(",").join(" ");
      query = query.select(selectFields);
   }

   //Sort Fields
   if (request.query.sort) {
      let sortFields = request.query.sort.split(",").join(" ");
      query = query.sort(sortFields);
   }

   query
      .then((data) => {
         response.status(200).json({ count: data.length, result: data });
      })
      .catch((error) => next(error));
};

// get patient by id
exports.getPatientById = (request, response, next) => {
   if(request.id == request.params.id || request.role == 'admin') {
      patientSchema
         .findOne({ _id: request.params.id })
         .then((data) => {
            if (data) {
               response.status(200).json(data);
            } else {
               next(new Error("This patient is not found"));
            }
         })
         .catch((error) => next(error));
   }
   else {
      let error = new Error('Not allow for you to show the information of this patient');
      error.status = 403;
      next(error);
   }
};

// Add new Patient data
exports.addPatient = (request, response, next) => {
   const hash = bcrypt.hashSync(request.body.password, salt);
   UserSchema.findOne({email: request.body.email}).then(function(data) {
      if(data == null) {
         let newPatient = new patientSchema({
            _id: request.body.id,
            firstName: request.body.firstName,
            lastName: request.body.lastName,
            age: request.body.age,
            address: request.body.address,
            email: request.body.email,
            password: hash,
            phone: request.body.phone,
         });
         if (request.file) {
            newPatient.image = request.file.path;
         }
         newPatient
            .save()
            .then((result) => {
               let newEmail = new UserSchema({
                  email: request.body.email,
                  password: request.body.password,
                  userId: result._id,
                  role: 'patient'
               })
               newEmail.save().then(function() {
                  response.status(200).json(result);
               })
            })
            .catch((error) => next(error));
      }
      else {
         next(new Error("This email is already used"))
      }
   }).catch(function(error) {
      next(error);
   })
};

// update Patient data by id
exports.updatePatient = (request, response, next) => {
   if(request.id == request.params.id || request.role == 'admin') {
      patientSchema.findOne({_id: request.params.id}, {_id: 0, email: 1, password: 1}).then(function(data) {
         if(data != null) {
            let oldEmail = data.email;
            let oldPassword = data.oldPassword
            let patientData = {
               firstName: request.body.firstName,
               lastName: request.body.lastName,
               age: request.body.age,
               address: request.body.address,
               "address.city": request.body.city,
               "address.street": request.body.street,
               "address.building": request.body.building,
               email: request.body.email,
               password: request.body.password,
               phone: request.body.phone,
            };
            if (request.file) {
               patientData.image = request.file.path;
            }
            if(oldEmail == request.body.email && oldPassword == request.body.password) {
               patientSchema
                  .updateOne(
                     {_id: request.params.id},
                     {
                        $set: patientData,
                     }
                  )
                  .then(() => {
                     response.status(200).json({ message: "Updated Successfully" });
                  })
                  .catch((error) => next(error));
            }
            else {
               UserSchema.updateOne({email: oldEmail}, 
                  {
                     $set: {
                        email: request.body.email,
                        password: request.body.password
                     }
               }).then(function() {
                  patientSchema
                  .updateOne(
                     {_id: request.params.id},
                     {
                        $set: patientData,
                     }
                  )
                  .then((resu) => {
                     if(resu.modifiedCount == 0) {
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
            next(new Error("This Patient is not found"));
         }
      })
   }
   else {
      let error = new Error('Not allow for you to change the information of this patient');
      error.status = 403;
      next(error);
   }
};

// Delete Patient by id
exports.deletePatient = (request, response, next) => {
   patientSchema.findOne({_id: request.params.id}, {email: 1, _id: 0}).then(function(data) {
      UserSchema.deleteOne({email: data.email}).then(function() {
         patientSchema
         .deleteOne({ _id: request.params.id })
         .then(() => {
            response.status(200).json({ message: "Deleted" });
         })
         .catch((error) => next(error));
      })
   })
};
