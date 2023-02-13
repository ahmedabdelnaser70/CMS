const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const saltRounds = 10;
const salt = bcrypt.genSaltSync(saltRounds);
require("../Models/doctorModel");
require("../Models/clinicModel");
require("../Models/appointmentModel");
require('../Models/usersModel');
const doctorSchema = mongoose.model("doctors");
const clinicSchema = mongoose.model("clinics");
const appointmentSchema = mongoose.model("appointments");
const UserSchema = mongoose.model('users');

exports.getAllDoctors = (request, response, next) => {
   let reqQuery = { ...request.query };
   let querystr = JSON.stringify(reqQuery);
   querystr = querystr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
   let query;
   let query1 = doctorSchema.find(JSON.parse(querystr));
   let query2 = doctorSchema.find(JSON.parse(querystr))
      .populate({
         path: "clinic",
         select: { name: 1, location: 1, _id: 0 },
      });

      
   //Filter Fields 
   if (request.query.select) {
      if (request.query.select.includes('clinic')) {
         query = query2;
      } else {
         query = query1;
      }
      let selectFields = request.query.select.split(',').join(' ');
      query = query.select(selectFields);
   } else {
      query = query2
   }

   //Sort Fields
   if (request.query.sort) {
      let sortFields = request.query.sort.split(",").join(" ");
      query = query2.sort(sortFields);
      if (request.query.select) {
         let selectFields = request.query.select.split(',').join(' ');
         query = query1.select(selectFields).sort(sortFields);
         if(request.query.select.includes('clinic')){
            query = query2.select(selectFields).sort(sortFields);
         }
      }
   }

   query
      .then((data) => {
         response.status(200).json({ count: data.length, result: data });
      })
      .catch((error) => {
         next(error);
      });
}

exports.addDoctor = (request, response, next) => {
   let flag = 1;
   const hash = bcrypt.hashSync(request.body.password, salt);
   clinicSchema.find({ _id: { $in: request.body.clinic } }, { doctors: 1, _id: 0 }).then((clinicData) => {
      if (clinicData.length == request.body.clinic.length) {
         clinicData.forEach((doctor) => {
            doctorSchema
               .find({ _id: { $in: doctor.doctors } }, { firstName: 1, lastName: 1, _id: 0 })
               .then((doctorData) => {
                  doctorData.forEach(function (doctor) {
                     if (
                        request.body.firstName == doctor.firstName &&
                        request.body.lastName == doctor.lastName
                     ) {
                        next(new Error("You cannot add two doctors with the same name in the same clinic"));
                        flag = 0;
                     }
                  });
                  if (flag) {
                     UserSchema.findOne({email: request.body.email}).then(function(data){
                        if(data == null) {
                           let newDoctor = new doctorSchema({
                              firstName: request.body.firstName,
                              lastName: request.body.lastName,
                              age: request.body.age,
                              email: request.body.email,
                              password: hash,
                              address: request.body.address,
                              phone: request.body.phone,
                              clinic: +(request.body.clinic),
                              specialty: request.body.specialty,
                           });
                           if (request.file) {
                              newDoctor.image = request.file.path;
                           }
                           newDoctor
                              .save()
                              .then((result) => {
                                 clinicSchema
                                    .updateMany(
                                       { _id: { $in: request.body.clinic } },
                                       { $push: { doctors: result._id } }
                                    )
                                    .then(function () {
                                       let newEmail = new UserSchema({
                                          email: request.body.email,
                                          password: request.body.password,
                                          userId: result._id,
                                          role: 'doctor'
                                       })
                                       newEmail.save().then(function() {
                                          response.status(201).json(result);
                                       })
                                    });
                              })
                              .catch((error) => {
                                 next(error);
                              });
                        }
                        else {
                           next(new Error("This email is already used"))
                        }
                     })
                  }
               })
               .catch((error) => {
                  next(error);
               });
         });
      } else {
         next(new Error("Non-existing clinics in the system"));
      }
   });
};

//----------CRUD BY PARAM---------------------//
exports.getDoctorById = (request, response, next) => {
   if(request.id == request.params.id || request.role == 'admin') {
      doctorSchema
      .findOne({
         _id: request.params.id,
      })
      .populate({
         path: "clinic",
         select: { location: 1, _id: 0 },
      })
      .then((data) => {
         if (data) {
            response.status(201).json(data);
         } else {
            next(new Error("Doctor does not exist"));
         }
      })
      .catch((error) => {
         next(error);
      });
   }
   else {
      let error = new Error('Not allow for you to show the information of this doctor');
      error.status = 403;
      next(error);
   }
};

exports.updateDoctorById = (request, response, next) => {
   if(request.id == request.params.id || request.role == 'admin') {
      doctorSchema.findOne({_id: request.params.id}, {_id: 0, email: 1, password: 1}).then(function(data) {
         if(data != null) {
            let oldEmail = data.email;
            let oldPassword = data.password;
            if(request.body.clinic != undefined) {
               clinicSchema.find({ _id: { $in: request.body.clinic } }).then((clinicData) => {
                  if (clinicData.length == request.body.clinic.length) {
                     clinicSchema
                        .updateMany(
                           { _id: { $in: request.body.clinic } },
                           { $push: { doctors: parseInt(request.params.id) } }
                        )
                        .then(function () {
                           updateDoctor(request, response, oldEmail, oldPassword, next)
                        });
                  } else {
                     next(new Error("One of entered clinics does not exist"));
                  }
               });
            }
            else {
               updateDoctor(request, response, oldEmail, oldPassword, next)         
            }
         
         }
         else {
            next(new Error("This Doctor is not found"));
         }
      })
   }
   else {
      let error = new Error('Not allow for you to update the information of this doctor');
      error.status = 403;
      next(error);
   }
};

exports.deleteDoctorById = (request, response, next) => {
   doctorSchema.findOne({_id: request.params.id},{email: 1, _id: 0}).then(function(data) {
      if(data != null) {
         UserSchema.deleteOne({email: data.email}).then(function() {
            doctorSchema.deleteOne({
               _id: request.params.id
            }).then(result => {
                  appointmentSchema.deleteOne({
                     doctorName: parseInt(request.params.id)
                  }).then(function() {
                        clinicSchema.updateMany({
                           doctors: parseInt(request.params.id)
                        }, {
                           $pull: { doctors: parseInt(request.params.id) }
                        }).then(function(){
                           response.status(200).json({ message: "Deleted" });
                        }).catch(error => {
                           next(error);
                        });
                     }).catch(error => {
                        next(error);
                     });
               }).catch(error => {
                  next(error);
               })
         })
      }
      else {
         next(new Error("This doctor is not found"))
      }
   });
};

function updateDoctor(request, response, oldEmail, oldPassword, next) {
   let doctorData = {
      firstName: request.body.firstName,
      lastName: request.body.lastName,
      age: request.body.age,
      address: request.body.address,
      email: request.body.email,
      password: request.body.password,
      phone: request.body.phone,
      clinic: request.body.clinic,
   };
   if (request.file) {
      doctorData.image = request.file.path;
   }
   if((request.body.email != undefined && oldEmail == request.body.email.trim()) && (request.body.password != undefined && oldPassword == request.body.password.trim())) {
      doctorSchema
         .updateOne(
            {
               _id: request.params.id,
            },
            {
               $set: doctorData,
            }
         )
         .then((result) => {
            response.status(201).json({
               message: "updated successfully",
            });
         })
         .catch((error) => {
            next(error);
         });
   }
   else {
      UserSchema.updateOne(
         {email: oldEmail}, 
         {
            $set: {
               email: request.body.email || oldEmail,
               password: request.body.password || oldPassword
            }
      })
      .then(function() {
         doctorSchema
            .updateOne(
               {
                  _id: request.params.id,
               },
               {
                  $set: doctorData,
               }
            )
            .then((resu) => {
               if(resu.modifiedCount == 0) {
                  response.status(200).json({Updated: true, Message: "Nothing is changed"});
               }
               else {
                  response.status(200).json({Updated: true, Message: "Doctor is updated successfully"});
               }
            })
            .catch((error) => {
               next(error);
            });
      }).catch(function() {
         next(new Error("This email is already used"))
      })
   }
}