const mongoose = require("mongoose");
require("./../Models/prescriptionModel");
const PresciptionsSchema = mongoose.model("presciptions");
require("./../Models/clinicModel");
const ClinicSchema = mongoose.model("clinics");
require("./../Models/doctorModel");
const DoctorSchema = mongoose.model("doctors");
require("./../Models/patientModel");
const PatientSchema = mongoose.model("patients");
require("./../Models/MedicineModel");
const MedicineSchema = mongoose.model("medicines");

exports.getAllPresciptions = function (request, response, next) {
   let reqQuery = { ...request.query };
   let querystr = JSON.stringify(reqQuery);
   querystr = querystr.replace(/\b(gt|gte|lt|lte|in)\b/g, (match) => `$${match}`);
   let query = PresciptionsSchema.find(JSON.parse(querystr), { __v: 0 });
   if (request.query.select) {
      let selectFields = request.query.select.split(",").join(" ");
      query = query.select(selectFields);
   }
   if (request.query.sort) {
      let sortFields = request.query.sort.split(",").join(" ");
      query = query.sort(sortFields);
   }
   query
      .populate([
         {
            path: "clinic",
            select: { location: 1, _id: 0 },
         },
         {
            path: "doctor",
            select: { firstName: 1, lastName: 1, specialty: 1, _id: 0 },
         },
         {
            path: "patient",
            select: { firstName: 1, lastName: 1, age: 1, _id: 0 },
         },
         {
            path: "medicine.medicineId",
            select: { name: 1, _id: 0 },
         },
      ])
      .then(function (data) {
         response.status(200).json(data);
      })
      .catch(function (error) {
         next(error);
      });
};

exports.getPresciptionById = function (request, response, next) {
   PresciptionsSchema.findOne(
      {
         _id: request.params.id,
      },
      { __v: 0 }
   )
      .populate([
         {
            path: "clinic",
            select: { location: 1, _id: 0 },
         },
         {
            path: "doctor",
            select: {firstName: 1, lastName: 1, specialty: 1 },
         },
         {
            path: "patient",
            select: { firstName: 1, lastName: 1, age: 1, _id: 0 },
         },
         {
            path: "medicine.medicineId",
            select: { name: 1, _id: 0 },
         },
      ])
      .then(function (result) {
         if(request.id == result.doctor._id || request.role == 'admin') {
            if (result) {
               response.status(200).json(result);
            } else {
               next(new Error("This presciption is not found"));
            }
         }
         else {
            let error = new Error('Not allow for you to show the information of this prescription')
            error.status = 403
            next(error);
         }
      })
      .catch(function (error) {
         next(error);
      });
};

exports.getPresciptionsByClinicId = function (request, response, next) {
   PresciptionsSchema.find({ clinic: request.params.id }, { clinic: 1, __v: 0 })
      .populate([
         {
            path: "doctor",
            select: { firstName: 1, lastName: 1, specialty: 1, _id: 0 },
         },
         {
            path: "patient",
            select: { firstName: 1, lastName: 1, age: 1, _id: 0 },
         },
         {
            path: "clinic",
            select: { manager: 1, _id: 0 },
         },
         {
            path: "medicine.medicineId",
            select: { name: 1, _id: 0 },
         },
      ])
      .then(function (result) {
         if(request.id == result.clinic.manager || request.role == 'admin') {
            if (result) {
               response.status(200).json(result);
            } else {
               next(new Error("This presciption is not found"));
            }
         }
         else {
            let error = new Error('Not allow for you to show the information of this prescription')
            error.status = 403
            next(error);
         }
      })
      .catch(function (error) {
         next(error);
      });
};

exports.getPresciptionsByDoctorId = function (request, response, next) {
   PresciptionsSchema.find({ doctor: request.params.id }, { doctor: 1, __v: 0 })
      .populate([
         {
            path: "clinic",
            select: { location: 1, _id: 0 },
         },
         {
            path: "patient",
            select: { firstName: 1, lastName: 1, age: 1, _id: 0 },
         },
         {
            path: "doctor",
            select: {_id: 1 },
         },
         {
            path: "medicine.medicineId",
            select: { name: 1, _id: 0 },
         },
      ])
      .then(function (result) {
         if(request.id == result.doctor._id || request.role == 'admin') {
            if (result) {
               response.status(200).json(result);
            } else {
               next(new Error("This presciption is not found"));
            }
         }
         else {
            let error = new Error('Not allow for you to show the information of this prescription')
            error.status = 403
            next(error);
         }
      })
      .catch(function (error) {
         next(error);
      });
};

exports.getPresciptionsByPatientId = function (request, response, next) {
   PresciptionsSchema.find({ patient: request.params.id }, { patient: 1, __v: 0 })
      .populate([
         {
            path: "clinic",
            select: { location: 1, _id: 0 },
         },
         {
            path: "doctor",
            select: { firstName: 1, lastName: 1, specialty: 1, _id: 0 },
         },
         {
            path: "patient",
            select: {_id: 1},
         },
         {
            path: "medicine.medicineId",
            select: { name: 1, _id: 0 },
         },
      ])
      .then(function (result) {
         if(request.id == result.patient._id || request.role == 'admin') {
            if (result) {
               response.status(200).json(result);
            } else {
               next(new Error("This presciption is not found"));
            }
         }
         else {
            let error = new Error('Not allow for you to show the information of this prescription')
            error.status = 403
            next(error);
         }
      })
      .catch(function (error) {
         next(error);
      });
};

exports.addPresciption = function (request, response, next) {
   if (request.body.medicine != undefined) {
      let tempArray = [];
      request.body.medicine.forEach(function (medicine) {
         tempArray.push(medicine.medicineId);
      });
      let uniqueMedicines = Array.from(new Set(tempArray));
      if (request.body.medicine.length == uniqueMedicines.length) {
         MedicineSchema.find({ _id: { $in: uniqueMedicines } }).then(function (result) {
            if (result.length == uniqueMedicines.length) {
               ClinicSchema.findOne({ _id: request.body.clinic }).then(function (clinicData) {
                  if (clinicData != null) {
                     DoctorSchema.findOne({ _id: request.body.doctor }).then(function (doctorData) {
                        if (doctorData != null) {
                           let presciptionDate = new Date();
                           PatientSchema.findOne({ _id: request.body.doctor }).then(function (patientData) {
                              if (patientData != null) {
                                 let newPresciption = new PresciptionsSchema({
                                    clinic: request.body.clinic,
                                    doctor: request.id,
                                    patient: request.body.patient,
                                    medicine: request.body.medicine,
                                    notes: request.body.notes,
                                    date: presciptionDate.toLocaleDateString(),
                                    time: presciptionDate.toLocaleTimeString(),
                                 });
                                 newPresciption
                                    .save()
                                    .then(function (result) {
                                       response.status(201).json(result);
                                    })
                                    .catch(function (error) {
                                       next(error);
                                    });
                              } else {
                                 next(new Error("You try to add patient not found"));
                              }
                           });
                        } else {
                           next(new Error("You try to add doctor not found"));
                        }
                     });
                  } else {
                     next(new Error("You try to add medicin not found"));
                  }
               });
            } else {
               next(new Error("You try to add medicin not found"));
            }
         });
      } else {
         next(new Error("You can add any medicine only one time in each presciption"));
      }
   } else {
      ClinicSchema.findOne({ _id: request.body.clinic }).then(function (clinicData) {
         if (clinicData != null) {
            DoctorSchema.findOne({ _id: request.body.doctor }).then(function (doctorData) {
               if (doctorData != null) {
                  PatientSchema.findOne({ _id: request.body.doctor }).then(function (patientData) {
                     if (patientData != null) {
                        let presciptionDate = new Date();
                        let newPresciption = new PresciptionsSchema({
                           clinic: request.body.clinic,
                           doctor: request.id,
                           patient: request.body.patient,
                           notes: request.body.notes,
                           date: presciptionDate.toLocaleDateString(),
                           time: presciptionDate.toLocaleTimeString(),
                        });
                        newPresciption
                           .save()
                           .then(function (result) {
                              response.status(201).json(result);
                           })
                           .catch(function (error) {
                              next(error);
                           });
                     } else {
                        next(new Error("You try to add patient not found"));
                     }
                  });
               } else {
                  next(new Error("You try to add doctor not found"));
               }
            });
         } else {
            next(new Error("You try to add medicin not found"));
         }
      });
   }
};

exports.updatePresciption = function (request, response, next) {
   PresciptionsSchema.findOne({ _id: request.params.id })
      .then(function (data) {
         if(request.id == data.doctor || request.role == 'admin') {
            if (request.body.medicine != undefined) {
               let oldMedicine = [];
               data.medicine.forEach(function (medId) {
                  oldMedicine.push(medId.medicineId);
               });
               let newMedicine = [];
               request.body.medicine.forEach(function (med) {
                  newMedicine.push(med.medicineId);
               });
               let unique = Array.from(new Set([...newMedicine]));
               if (unique.length == newMedicine.length) {
                  MedicineSchema.find({ _id: { $in: unique } })
                     .then(function (medicineData) {
                        if (medicineData.length == unique.length) {
                           PatientSchema.findOne({ _id: request.body.patient }, { _id: 1 }).then(function (patientData) {
                              if (patientData != null) {
                                 ClinicSchema.findOne({ _id: request.body.clinic }, { _id: 1 })
                                    .then(function (ClinicData) {
                                       if (ClinicData != null) {
                                          PresciptionsSchema.updateOne(
                                             {
                                                _id: request.params.id,
                                             },
                                             {
                                                $set: {
                                                   clinic: request.body.clinic,
                                                   patient: request.body.patient,
                                                   medicine: request.body.medicine,
                                                },
                                             }
                                          )
                                             .then(function (result) {
                                                if (result.modifiedCount == 0) {
                                                   response.status(200).json({ Updated: true, Message: "Nothing is changed" });
                                                } else {
                                                   response.status(200).json({ Updated: true, Message: "Prescription is updated successfully" });
                                                }
                                             })
                                             .catch(function (error) {
                                                next(error);
                                             });
                                       } else {
                                          next(new Error("This patient is not found"));
                                       }
                                    })
                                    .catch(function (error) {
                                       next(error);
                                    });
                              } else {
                                 next(new Error("This patient is not found"));
                              }
                           });
                        } else {
                           next(new Error("You cannot add medicine not found"));
                        }
                     })
                     .catch(function (error) {
                        next(error);
                     });
               } else {
                  next(new Error("You cannot add the same medicine 2 times"));
               }
            } else {
               PatientSchema.findOne({ _id: request.body.patient }, { _id: 1 }).then(function (patientData) {
                  if (patientData != null) {
                     ClinicSchema.findOne({ _id: request.body.clinic }, { _id: 1 })
                        .then(function (ClinicData) {
                           if (ClinicData != null) {
                              PresciptionsSchema.updateOne(
                                 {
                                    _id: request.params.id,
                                 },
                                 {
                                    $set: {
                                       clinic: request.body.clinic,
                                       patient: request.body.patient,
                                    },
                                 }
                              )
                                 .then(function (result) {
                                    if (result.modifiedCount == 0) {
                                       response.status(200).json({ Updated: true, Message: "Nothing is changed" });
                                    } else {
                                       response.status(200).json({ Updated: true, Message: "Prescription is updated successfully" });
                                    }
                                 })
                                 .catch(function (error) {
                                    next(error);
                                 });
                           } else {
                              next(new Error("This patient is not found"));
                           }
                        })
                        .catch(function (error) {
                           next(error);
                        });
                  } else {
                     next(new Error("This patient is not found"));
                  }
               });
            }
         }
         else {
            let error = new Error("Not allow for you to update the information of this prescription")
            error.status = 403
            next(error);
         }
      })
      .catch(function () {
         next(new Error("This presciption not found"));
      });
};

exports.deletePresciption = function (request, response, next) {
   PresciptionsSchema.findOne({_id: request.params.id}, {doctor: 1, _id: 0}).then(function(data) {
      if(data != null && (request.id == data.doctor || request.role == 'admin')) {
         PresciptionsSchema.deleteOne({
            _id: request.params.id,
         })
            .then(function (result) {
               if (result.acknowledged && result.deletedCount == 1) {
                  response.status(200).json({ Deleted: true, Message: "This Prescription is deleted successfully" });
               } else {
                  response.status(200).json({ Deleted: false, Message: "This Prescription is not found" });
               }
            })
            .catch(function (error) {
               next(error);
            });
      }
      else {
         if(data == null) {
            let error = new Error("This Prescription is not found");
         }
         else {
            let error = new Error("Not allow for you to delete this prescription")
         }
      }
   })
};
