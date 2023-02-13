const { body } = require("express-validator");
const mongoose = require ("mongoose");
require("./../Models/clinicModel");
const ClinicSchema = mongoose.model("clinics");
require("./../Models/doctorModel");
const DoctorSchema = mongoose.model("doctors");
require("./../Models/employeeModel");
const EmployeeSchema = mongoose.model("employees");

exports.getAllClinic = function(request, response, next) {
    let reqQuery = {...request.query};
    let querystr = JSON.stringify(reqQuery);
    querystr = querystr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
    let query = ClinicSchema.find(JSON.parse(querystr));
    if(request.query.select) {
        let selectFields = request.query.select.split(',').join(' ');
        query = query.select(selectFields);
    }
    if(request.query.sort) {
        let sortFields = request.query.sort.split(',').join(' ');
        query = query.sort(sortFields);
    }
    query.populate([
		{
			path: "doctors",
			select: {firstName:1, lastName: 1, specialty: 1, _id: 0 }
		},
		{
			path: "manager",
			select: {firstName:1, lastName: 1, specialty: 1 }
		}
	]).then(function(data) {
            response.status(200).json(data);
        })
        .catch(function(error) {
            next(error);
        })
}

exports.getClinicById = function(request, response, next) {
	ClinicSchema.findOne(
		{
			_id: request.params.id
		}).populate([
			{
				path: "doctors",
				select: {firstName:1, lastName: 1, specialty: 1, _id: 0 }
			},
			{
				path: "manager",
				select: {firstName:1, lastName: 1, specialty: 1 }
			}
		]).then(function(result) {
			if(result) {
				if(request.id == result.manager._id || request.role == 'admin') {
					response.status(200).json(result);
				}
				else {
					let error = new Error('Not allow for you to show the information of this clinic');
					error.status = 403;
					next(error);
				}
			}
			else {
				next(new Error("This clinic is not found"));
			}
	}).catch(function (error){
		next(error);
	})
}

exports.getClinicServices = function(request, response, next) {
	ClinicSchema.findOne(
		{
			_id: request.params.id
		}).populate([
		{
			path: "doctors",
			select: {specialty: 1, _id: 0}
		}
	]).then(function(data) {
			if(data != null) {
				response.status(200).json(data.doctors);
			}
			else {
				next(new Error("This clinic is not found"));
			}
        })
        .catch(function(error) {
            next(error);
        })
}

exports.addClinic = function(request, response, next) {
	if(request.body.doctors != undefined) {
		let unique = Array.from(new Set([...request.body.doctors]))
		if(request.body.manager != undefined) {
			unique.push(request.body.manager)
		}
		DoctorSchema.find({_id: {$in: unique}}).then(function(data) {
			let arrayOfDoctors = []
			data.forEach(function(item) {
				arrayOfDoctors.push(item._id)
			})
			let notFoundDoctor = unique.filter(function(e) {
				return arrayOfDoctors.indexOf(e) == -1;
			})
			if(notFoundDoctor.length == 0) {
				let newClinic = new ClinicSchema({
					location: request.body.location,
					mobilePhone: request.body.mobilePhone,
					doctors: unique,
					manager: request.body.manager
				})
				newClinic.save().then(function(result) {
					DoctorSchema.updateMany({_id: {$in: unique}}, {$push: {clinic: result._id}}).then(function(res) {
						response.status(201).json(result);
					}).catch(function(error) {
						console.log(error);
					})
				}).catch(function(error) {
					next(error);
				})
			}
			else {
				next(new Error(`You cannot add doctor doesn't found`))			
			}
		})
	}
	else {
		if(request.body.manager != undefined) {
			DoctorSchema.findOne({_id: request.body.manager}, {_id: 1}).then(function(result) {
				if(result != null) {
					let newClinic = new ClinicSchema({
						location: request.body.location,
						mobilePhone: request.body.mobilePhone,
						manager: request.body.manager
					})
					newClinic.save().then(function(result) {
						response.status(201).json(result);
					}).catch(function(error) {
						next(error);
					})
				}
				else {
					next(new Error('This manager is not found'))
				}
			})
		}
		else {
			let newClinic = new ClinicSchema({
				location: request.body.location,
				mobilePhone: request.body.mobilePhone,
	
			})
			newClinic.save().then(function(result) {
				response.status(201).json(result);
			}).catch(function(error) {
				next(error);
			})
		}
	}
}

exports.updateClinic = function(request, response, next){
	ClinicSchema.findOne({_id: request.params.id}, {doctors: 1, manager: 1, _id: 0}).then(function(data) {
		if(data != null) {
			if(request.id == data.manager || request.role == 'admin') {	
				let oldDoctors = data.doctors;
				if(request.body.doctors != undefined) {
					let unique = Array.from(new Set([...request.body.doctors]))
					if(request.body.manager != undefined) {
						unique.push(request.body.manager)
					}
					DoctorSchema.find({_id: {$in: unique}}).then(function(data) {
						let arrayOfDoctors = []
						data.forEach(function(item) {
							arrayOfDoctors.push(item._id)
						})
						let notFoundDoctor = unique.filter(function(e) {
							return arrayOfDoctors.indexOf(e) == -1;
						})
						if(notFoundDoctor.length == 0) {
							ClinicSchema.updateOne(
								{
									_id: request.params.id,
								},
								{ 
									$set: {
										name: request.body.name,
										location: request.body.location,
										mobilePhone: request.body.mobilePhone,
										doctors: unique,
										manager: request.body.manager
									}
								}
							).then(function(result) {
								if(result.modifiedCount == 0) {
									response.status(200).json({Updated: true, Message: "Nothing is changed"});
								}
								else {
									if(unique.length > oldDoctors.length) { // add
										let newDoctor = unique.filter(function(e) {
											return oldDoctors.indexOf(e) == -1;
										})
										DoctorSchema.updateMany({_id: {$in: newDoctor}}, {$push: {clinic: +(request.params.id)}}).then(function() {
											response.status(200).json({Updated: true, Message: "This clinic is updated successfully"});
										})
										
									}
									else if(unique.length < oldDoctors.length) { // delete
										let deletedDoctor = oldDoctors.filter(function(e) {
											return unique.indexOf(e) == -1;
										})
										DoctorSchema.updateMany({_id: {$in: deletedDoctor}}, {$pull: {clinic: +(request.params.id)}}, {multi: true}).then(function() {
											// DoctorSchema.deleteMany({clinic: {$size: 0}}).then(function() {
												response.status(200).json({Updated: true, Message: "This clinic is updated successfully"});
											// })
										})
									}
									else { // add & delete
										let newDoctor = unique.filter(function(e) {
											return oldDoctors.indexOf(e) == -1;
										})
										let deletedDoctor = oldDoctors.filter(function(e) {
											return unique.indexOf(e) == -1;
										})
										DoctorSchema.updateMany({_id: {$in: newDoctor}}, {$push: {clinic: +(request.params.id)}}).then(function() {
											DoctorSchema.updateMany({_id: {$in: deletedDoctor}}, {$pull: {clinic: +(request.params.id)}}, {multi: true}).then(function() {
												// DoctorSchema.deleteMany({clinic: {$size: 0}}).then(function() {
													response.status(200).json({Updated: true, Message: "This clinic is updated successfully"});
												// })
											})
										})
									}
								}
								
							}).catch(function(error) {
								next(error);
							})
						}
						else {
							next(new Error(`You cannot add doctor doesn't found`))			
						}
					})
				}
				else {
					if(request.body.manager != undefined) {
						DoctorSchema.findOne({_id: request.body.manager}, {_id: 1}).then(function(result) {
							if(result != null) {
								ClinicSchema.updateOne(
									{
										_id: request.params.id,
									},
									{ 
										$set: {
											name: request.body.name,
											location: request.body.location,
											mobilePhone: request.body.mobilePhone,
											manager: request.body.manager
										}
									}
								).then(function(result) {
									if(result.modifiedCount == 0) {
										response.status(200).json({Updated: true, Message: "Nothing is changed"});
									}
									else {
										response.status(200).json({Updated: true, Message: "This clinic is updated successfully"});
									}
								}).catch(function(error) {
									next(error);
								})
							}
							else {
								next(new Error("This manager is not found"))
							}
						})
					}
					else {
						ClinicSchema.updateOne(
							{
								_id: request.params.id,
							},
							{ 
								$set: {
									name: request.body.name,
									location: request.body.location,
									mobilePhone: request.body.mobilePhone,
								}
							}
						).then(function(result) {
							if(result.modifiedCount == 0) {
								response.status(200).json({Updated: true, Message: "Nothing is changed"});
							}
							else {
								response.status(200).json({Updated: true, Message: "This clinic is updated successfully"});
							}
						}).catch(function(error) {
							next(error);
						})
					}
				}
			}
			else {
				let error = new Error('Not allow for you to update the information of this clinic');
				error.status = 403;
				next(error);
			}
		}
		else {
			next(new Error('This clinic not found'));
		}
	}).catch(function(error) {
		next(error);
	})
}

exports.deleteClinic = function(request, response, next){
	ClinicSchema.deleteOne({
		_id: request.params.id,
	}).then(function(result) {
		DoctorSchema.updateMany({}, {$pull: {clinic: +(request.params.id)}}, {multi: true}).then(function() {
			if(result.acknowledged && result.deletedCount == 1) {
				EmployeeSchema.deleteMany({clinic: request.params.id}).then(function() {
					response.status(200).json({Deleted: true});
				})
			}
			else {
				response.status(200).json({Deleted: false});
			}
		})
	}).catch(function(error) {
		next(error);
	})
}