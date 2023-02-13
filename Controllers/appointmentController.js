const mongoose = require('mongoose');
require('../Models/appointmentModel');
require('../Models/clinicModel');
require('../Models/doctorModel');
require('../Models/patientModel');
require('../Models/employeeModel');
const appointmentSchema = mongoose.model('appointments');
const clinicSchema = mongoose.model('clinics');
const doctorSchema = mongoose.model('doctors');
const patientSchema = mongoose.model('patients');
const EmployeeSchema = mongoose.model('employees');

exports.getAllAppointments = (request, response, next) => {
    let reqQuery = { ...request.query }; //using spread operator make any change on reqQuery wont affect request.query
    let querystr = JSON.stringify(reqQuery);
    querystr = querystr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
    let findCondition = JSON.parse(querystr);
    if (request.role == 'doctor') {
        findCondition.doctorName = request.id;
    } else if (request.role == 'patient') {
        findCondition.patient = request.id;
    }
    let query = appointmentSchema.find(findCondition);

    //Filtering
    if (request.query.select) {
        if(request.query.select.includes('clinic')&&request.query.select.includes('doctorName')&&request.query.select.includes('patient')){
            query = query.populate({path: 'clinic', select: { name: 1, location: 1, _id: 0 }})
            .populate({path: 'doctorName', select: { firstName: 1, lastName: 1, phone: 1, _id: 0 }})
            .populate({path: 'patient', select: { firstName: 1, lastName: 1 }})
        }
        else if(request.query.select.includes('clinic')&&request.query.select.includes('doctorName')){
            query = query.populate({path: 'clinic', select: { name: 1, location: 1, _id: 0 }})
            .populate({path: 'doctorName', select: { firstName: 1, lastName: 1, phone: 1, _id: 0 }})
        }else if(request.query.select.includes('clinic')&&request.query.select.includes('patient')){
            query = query.populate({path: 'clinic', select: { name: 1, location: 1, _id: 0 }})
            .populate({path: 'patient', select: { firstName: 1, lastName: 1 }})
        }else if(request.query.select.includes('doctorName')&&request.query.select.includes('patient')){
            query = query.populate({path: 'doctorName', select: { firstName: 1, lastName: 1, phone: 1, _id: 0 }})
            .populate({path: 'patient', select: { firstName: 1, lastName: 1 }})
        }
        else if(request.query.select.includes('clinic')){
            query = query.populate({path: 'clinic', select: { name: 1, location: 1, _id: 0 }})
        }else if(request.query.select.includes('doctorName')){
            query = query.populate({path: 'doctorName', select: { firstName: 1, lastName: 1, phone: 1, _id: 0 }})
        }else if(request.query.select.includes('patient')){
            query = query.populate({path: 'patient', select: { firstName: 1, lastName: 1 }})
        }
        let selectFields = request.query.select.split(',').join(' ');
        query = query.select(selectFields);
    }
    else {
        query = query.populate({path: 'doctorName', select: { firstName: 1, lastName: 1, phone: 1, _id: 0 }})
        .populate({path: 'patient', select: { firstName: 1, lastName: 1 }})
        .populate({path: 'clinic', select: { name: 1, location: 1, _id: 0 }})
    }

    if (request.query.sort) {
        let sortFields = request.query.sort.split(',').join(' ');
        query = query.sort(sortFields);
    }

    query
        .then(result => {
            response.status(200).json(result);
        })
        .catch(error => {
            next(error);
        })
}

exports.addAppointment = (request, response, next) => {
    clinicSchema.findOne({ _id: request.body.clinic })
        .then(clinic => {
            if (clinic) {
                doctorSchema.findOne({ _id: request.body.doctor })
                    .then(doctor => {
                        if (doctor) {
                            patientSchema.findOne({ _id: request.body.patient })
                                .then(patient => {
                                    if (patient) {
                                        appointmentSchema.findOne({ doctorName: request.body.doctor, date: request.body.date, timeFrom: request.body.timeFrom })
                                            .then(existAppointment => {
                                                if (existAppointment) {
                                                    next(new Error('Doctor cannot have two appointment at same time'))
                                                } else {
                                                    let newAppointment = appointmentSchema({
                                                        clinic: request.body.clinic,
                                                        doctorName: request.body.doctor,
                                                        patient: request.body.patient,
                                                        date: request.body.date,
                                                        timeFrom: request.body.timeFrom,
                                                        timeTo: request.body.timeTo
                                                    })
                                                    newAppointment.save()
                                                        .then(result => {
                                                            response.status(200).json(result);
                                                        })
                                                        .catch(error => {
                                                            next(error);
                                                        })
                                                }
                                            })
                                    } else {
                                        next(new Error('The entered patient does not exist'));
                                    }
                                })
                        } else {
                            next(new Error('The entered doctor does not exist'));
                        }
                    })
            } else {
                next(new Error('The entered clinic does not exist'));
            }
        })
        .catch(error => {
            next(error);
        })
}

//----------------CRUD BY ID PARAM--------------------------------------//
exports.getAppointmentById = (request, response, next) => {
    appointmentSchema.findOne({ _id: request.params.id })
        .populate({
            path: 'clinic', select: {location: 1, _id: 0 }
        })
        .populate({
            path: 'doctorName', select: { firstName: 1, lastName: 1, _id: 0 }
        })
        .populate({
            path: 'patient', select: { firstName: 1, lastName: 1, age: 1, _id: 0 }
        })
        .then(result => {
            if (result)
                response.status(200).json(result);
            else
                next(new Error('Appointment does not exist'));
        })
        .catch(error => {
            next(error);
        })
}

exports.updateAppointmentById = (request, response, next) => {
    clinicSchema.findOne({ _id: request.body.clinic })
        .then(clinic => {
            if (clinic) {
                doctorSchema.findOne({ _id: request.body.doctor })
                    .then(doctor => {
                        if (doctor) {
                            patientSchema.findOne({ _id: request.body.patient })
                                .then(patient => {
                                    if (patient) {
                                        appointmentSchema.updateOne({
                                            _id: request.params.id
                                        }, {
                                            $set: {
                                                clinic: request.body.clinic,
                                                doctorName: request.body.doctor,
                                                patient: request.body.patient,
                                                date: request.body.date,
                                                timeFrom: request.body.timeFrom,
                                                timeTo: request.body.timeTo
                                            }
                                        })
                                            .then(result => {
                                                response.status(201).json({
                                                    message: "updated successfully"
                                                });
                                            })
                                            .catch(error => {
                                                next(error);
                                            })
                                    } else {
                                        next(new Error('The entered patient does not exist'));
                                    }
                                })
                        } else {
                            next(new Error('The entered doctor does not exist'));
                        }
                    })
            } else {
                next(new Error('The entered clinic does not exist'));
            }
        })
        .catch(error => {
            next(error);
        })
}

exports.deleteAppointmentById = (request, response, next) => {
    appointmentSchema.deleteOne({
        _id: request.params.id
    })
        .then(result => {
            response.status(201).json(result);
        })
        .catch(error => {
            next(error);
        })
}

exports.getappointmentsByClinicId = function (request, response, next) {
    EmployeeSchema.find({ clinic: request.params.id }, {email: 0, password: 0}).then(function(date){
        if(date.length > 0) {
            let action = date.some(function(emp) {
                return request.id == emp._id
            })
            if(action || request.role == 'admin') {
                appointmentSchema.find({ clinic: request.params.id })
                    .populate({
                        path: 'clinic', select: { name: 1, location: 1, _id: 0 }
                    })
                    .populate({
                        path: 'doctorName', select: { firstName: 1, lastName: 1, phone: 1, _id: 0 }
                    })
                    .populate({
                        path: 'patient', select: { firstName: 1, lastName: 1 }
                    })
                    .then(result => {
                        response.status(200).json(result);
                    })
                    .catch(error => {
                        next(error);
                    })
            }
            else {
                let error = new Error("Not Allow for you to show the appointments of this clinic");
                error.status = 403
                next(error);
            }
        }
        else {
            let error = new Error("Not Allow for you to show the appointments of this clinic");
            error.status = 403
            next(error);
        }
    })
}

exports.getappointmentsByDoctorId = function (request, response, next) {
    if(request.id == request.params.id || request.role == "admin") {
        appointmentSchema.find({ doctorName: request.params.id })
            .populate({
                path: 'clinic', select: { name: 1, location: 1, _id: 0 }
            })
            .populate({
                path: 'doctorName', select: { firstName: 1, lastName: 1, phone: 1, _id: 0 }
            })
            .populate({
                path: 'patient', select: { firstName: 1, lastName: 1 }
            })
            .then(result => {
                response.status(200).json(result);
            })
            .catch(error => {
                next(error);
            })
    }
    else {
        let error = new Error("Not Allow for you to show the appointments of this doctor");
        error.status = 403
        next(error);
    }
}

exports.getappointmentsByPatientId = function (request, response, next) {
    if(request.id == request.params.id || request.role == "admin") {
        appointmentSchema.find({ patient: request.params.id })
            .populate({
                path: 'clinic', select: { name: 1, location: 1, _id: 0 }
            })
            .populate({
                path: 'doctorName', select: { firstName: 1, lastName: 1, phone: 1, _id: 0 }
            })
            .populate({
                path: 'patient', select: { firstName: 1, lastName: 1 }
            })
            .then(result => {
                response.status(200).json(result);
            })
            .catch(error => {
                next(error);
            })
    }
    else {
        let error = new Error("Not Allow for you to show the appointments of this patient");
        error.status = 403
        next(error);
    }
}