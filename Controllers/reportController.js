const mongoose = require("mongoose");
require("../Models/reportModel")
const pdfKit = require("pdfkit");
let fs = require("fs");
const appointmentSchema = mongoose.model("appointments")
const invoiceSchema = mongoose.model("invoices")

//get all appointment reports 
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

function formatDate(date) {
    return date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
}

// Appointments Daily Report
exports.getDailyAppointmentReport = (request, response, next) => {
	let date = new Date();
	appointmentSchema
	.find({ date: formatDate(date)},{_id:0,__v:0},{_id:0,__v:0})
	.populate({ path: "patient", select: {  _id: 1 ,__v:0 , email:0 , password:0,address:0} })
	.populate({ path: "doctorName",select: { _id: 0,__v:0,age:0,email:0,password:0,address:0},})
	.populate({ path: "clinic", select: { _id: 0 ,__v:0,doctors:0} })
	.then((data) => {
		createPdf(data);
		response.status(200).json(data);
	})
	.catch((error) => next(error));
};

// Appointments Daily Reports for Clinic
exports.getClinicDailyAppointmentReport = (request, response, next) => {
	let date = new Date();
	appointmentSchema
	.find({ date: formatDate(date), clinic : request.params.id },{_id:0,__v:0})
	.populate({ path: "clinic", select: { _id: 0,manager: 1} })
	.populate({ path: "patient", select: { _id: 0,email:0,password:0,__v:0 } })
	.populate({ path: "doctorName",select: {_id:0,firstName:1,lastName:1,specialty:1,phone:1},})
	.then((data) => {
		if(data.length != 0) {
			if(request.id == data.clinic.manager || request.role == 'admin') {
				response.status(200).json(data);
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
	})
	.catch((error) => next(error));
};

// Appointments Daily Reports for doctor
exports.getDoctorDailyAppointmentReport = (request, response, next) => {
	if(request.id == request.params.id || request.role == 'admin') {
		let date = new Date();
		appointmentSchema
		.find({ date: formatDate(date), doctor : request.params.id },{_id:0,__v:0,doctorName:0})
		.populate({ path: "patient", select: { _id: 0,email:0,password:0,__v:0 ,address:0} })
		.populate({ path: "clinic", select: { _id: 0 , doctors:0 , __v:0 } })
		.then((data) => {
		response.status(200).json(data);
		})
		.catch((error) => next(error));
	}
	else {
		let error = new Error('Not allow for you to show the information of this doctor');
		error.status = 403;
		next(error);
	}
};


// Appointments Daily Reports for patient
exports.getPatientDailyAppointmentReport = (request, response, next) => {
	if(request.id == request.params.id || request.role == "admin") {
		let date = new Date();
		appointmentSchema
		.find({ date: formatDate(date), patient : request.params.id },{_id:0,__v:0, patient:0 })
		.populate({ path: "clinic", select: { _id: 0 ,doctors:0,__v:0} })
		.populate({
		path: "doctorName",
		select: { _id: 0,firstName:1 ,lastName :1 ,specialty :1},
		})
		.then((data) => {
		response.status(200).json(data);
		})
		.catch((error) => next(error));
	}
	else {
		let error = new Error('Not allow for you to show the information of this patient');
		error.status = 403;
		next(error);
	}
};

//------------------ Appointment reports for specific day ------------------------
// Appointments Report for specific day 
exports.getAppointmentReportForaDay = (request, response, next) => {
	appointmentSchema
	.find({ date:request.query.date},{_id:0,__v:0})
	.populate({ path: "patient", select: { _id: 0 ,__v:0 , email:0 , password:0,address:0} })
	.populate({ path: "doctorName",select: { _id: 0,__v:0,age:0,email:0,password:0,address:0} })
	.populate({ path: "clinic", select: { _id: 0,__v:0,doctors:0} })
	.then((data) => {
		response.status(200).json(data);
	})
	.catch((error) => next(error));
};

// Appointments Report for specific day for Clinic
exports.getClinicAppointmentReportForaDay = (request, response, next) => {
	appointmentSchema
	.find({ date:request.query.date, clinic : request.params.id },{_id:0,__v:0})
	.populate({ path: "clinic", select: { _id: 0,manager: 1} })
	.populate({ path: "patient", select: { _id: 0,email:0,password:0,__v:0 } })
	.populate({ path: "doctorName",select: {_id:0,firstName:1,lastName:1,specialty:1,phone:1},})
	.then((data) => {
		if(data.length != 0) {
			if(request.id == data.clinic.manager || request.role == 'admin') {
				response.status(200).json(data);
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
	})
	.catch((error) => next(error));
};

// Appointments Report for specifi day for doctor
exports.getDoctorAppointmentReportForaDay = (request, response, next) => {
	if(request.id == request.params.id || request.role == "admin") {
		appointmentSchema
		.find({ date:request.query.date, doctor : request.params.id },{_id:0,__v:0,doctorName:0})
		.populate({ path: "patient", select: { _id: 0,email:0,password:0,__v:0 ,address:0} })
		.populate({ path: "clinic", select: { _id: 0 , doctors:0 , __v:0 } })
		.then((data) => {
		response.status(200).json(data);
		})
		.catch((error) => next(error));
	}
	else {
		let error = new Error('Not allow for you to show the information of this doctor');
		error.status = 403;
		next(error);
	}
};


// Appointments report  for specifi day for patient 
exports.getPatientAppointmentReportForaDay = (request, response, next) => {
	if(request.id == request.params.id || request.role == "admin") {
		appointmentSchema
		.find({ date:request.query.date, patient : request.params.id },{_id:0,__v:0, patient:0 })
		.populate({ path: "clinic", select: { _id: 0 ,doctors:0,__v:0} })
		.populate({
		path: "doctorName",
		select: { _id: 0,firstName:1 ,lastName :1 ,specialty :1},
		})
		.then((data) => {
		response.status(200).json(data);
		})
		.catch((error) => next(error));
	}
	else {
		let error = new Error('Not allow for you to show the information of this patient');
		error.status = 403;
		next(error);
	}
};

/*************************** INVOICES REPORTS *************************** */

// Invoices Daily Report => Done
exports.getDailyInvoicesReport = (request, response, next) => {
	let date = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "numeric", year: "numeric" });
	invoiceSchema
	.find({ date :date ,clinic : request.params.id },{_id:0,__v:0,clinic:0})
	.populate({ path: "patientId", select: { _id: 0,email:0,password:0,__v:0 } })
	.populate({ path: "clinicId", select: { email:0,password:0,__v:0, doctors:0 } })
	.then((data) => {
	response.status(200).json(data);

	})
	.catch((error) => next(error));
};

// invioces Daily Reports for Clinic => Done
exports.getClinicDailyInvoicesReport = (request, response, next) => {
	let date = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "numeric", year: "numeric" });
	invoiceSchema
	.find({ date :date ,clinic : request.params.id })
	.populate({ path: "patientId", select: { _id: 1,email:0,password:0,__v:0 } })
	.populate({ path: "clinicId", select: {doctors:0 } })
	.populate({ path: "services.doctorId", select: {_id: 0, specialty: 1}})
	.then((data) => {
		if(data.length != 0) {
			if(request.id == clinicId.manager || request.role == "admin") {
				createPdf(data)
				response.status(200).json(data);
			}
			else {
				let error = new Error('Not allow for you to show the information of this clinic');
				error.status = 403;
				next(error);
			}
		}
		else {
			next(new Error("This clinic is not found"))
		}

	})
	.catch((error) => next(error));
};

//Done
exports.getPatientDailyInvoicesReport = (request, response, next) => {
	if(request.id == request.params.id || request.role == "admin") {
		let date = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "numeric", year: "numeric" });
		invoiceSchema
		.find({ date :date, patientId : request.params.id })
		.populate({ path: "patientId", select: { _id: 0,email:0,password:0,__v:0 } })
		.populate({ path: "clinicId", select: { email:0,password:0,__v:0, doctors:0 } })
		.populate({ path: "services.doctorId", select: {_id: 0, specialty: 1}})
		.then((data) => {
		createPdf(data)
		response.status(200).json(data);
	
		})
		.catch((error) => next(error));
	}
	else {
		let error = new Error('Not allow for you to show the information of this patient');
		error.status = 403;
		next(error)
	}
};
//--------------- invoices report for a specifc day ------------//

// Invoices for specific day  Report => Done
exports.getInvoicesReportForaDay = (request, response, next) => {
	let date = request.query.date;
	invoiceSchema
	.find({ date: date},{_id:0,__v:0},{_id:0,__v:0})
	.populate({ path: "patientId", select: { _id: 0,email:0,password:0,__v:0 } })
	.populate({ path: "clinicId", select: { email:0,password:0,__v:0, doctors:0 } })
	.populate({ path: "services.doctorId", select: {_id: 0, specialty: 1}})
	.then((data) => {
		createPdf(data)
	response.status(200).json(data);
	})
};

// Invoices for specific day  Report  for Clinic => Done
exports.getClinicInvoicesReportForaDay = (request, response, next) => {
	let date = request.query.date;
	invoiceSchema
	.find({ date :date ,clinic : request.params.id },{_id:0,__v:0,clinic:0})
	.populate({ path: "patientId", select: { _id: 0,email:0,password:0,__v:0 } })
	.populate({ path: "clinicId", select: { email:0,password:0,__v:0, doctors:0 } })
	.populate({ path: "services.doctorId", select: {_id: 0, specialty: 1}})
	.then((data) => {
		if(data.length != 0) {
			if(request.id == data.clinic.manager || request.role == 'admin') {
				createPdf(data)
				response.status(200).json(data);
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
		
	})
	.catch((error) => next(error));
};


// Invoices for specific day  Report  for patient
exports.getPatientInvoicesReportForaDay = (request, response, next) => {
	if(request.id == request.params.id || request.role == "admin") {
		let date =  request.query.date;
		invoiceSchema
		.find({ date: date ,patientId :request.params.id })
		.populate({ path: "clinicId", select: {doctors:0,__v:0} })
		.populate({ path: "patientId", select: {email:0,password:0,__v:0 ,age :0} })
		.populate({ path: "services.doctorId", select: {_id: 0, specialty: 1}})
		.then((data) => {
			createPdf(data)
			response.status(200).json(data);
		})
		.catch((error) => next(error));
	}
	else {
		let error = new Error('Not allow for you to show the information of this patient');
		error.status = 403;
		next(error)
	}
};


//*********************************** pdf fuction ***************************************  

function createPdf(doc) {
	for(let res of doc) {
		try {
		let clinicLogo = "./images/clinicLogo.png";
		let fileName = "./InvoicesPdf/invoice " + res._id + ".pdf";
		let fontNormal = "Helvetica";
		let fontBold = "Helvetica-Bold";
		let total = 0;
		let services = [];
		for (let i = 0; i < res.services.length; i++) {
			services.push({
				id: res._id,
				name: res.services[i].doctorId.specialty,
				company: "Acer",
				unitPrice: res.services[i].price,
				totalPrice: res.services[i].price,
			});
			total += 1 * res.services[i].price;
		}
		let sellerInfo = {
			companyName: "iti clinic",
			city: res.clinicId.location.city,
			street: res.clinicId.location.street,
			country: "Egypt",
			contactNo: res.clinicId.mobilePhone,
		};
	
		let customerInfo = {
			customerName: res.patientId.firstName + " " + res.patientId.lastName,
			city: res.patientId.address.city,
			street: res.patientId.address.street,
			country: "Egypt",
			contactNo: res.patientId.phone,
		};
		let orderInfo = {
			orderNo: res._id,
			invoiceNo: res._id,
			clinicId: res.clinicId._id,
			patientId: res.patientId._id,
			invoiceDate: res.date,
			invoiceTime: "10:57:00 PM",
			products: services,
			totalValue: total,
		};
		let pdfDoc = new pdfKit();
		let stream = fs.createWriteStream(fileName);
		pdfDoc.pipe(stream);
	
		pdfDoc.text("Clinic", 5, 5, { align: "center", width: 600 });
		pdfDoc.image(clinicLogo, 25, 20, { width: 50, height: 50 });
		pdfDoc.font(fontBold).text("ITI CLINICS", 7, 75);
		pdfDoc.font(fontNormal).fontSize(14).text("Order Invoice/Bill Receipt", 400, 30, { width: 200 });
		pdfDoc.fontSize(10).text(res.date, 400, 46, { width: 200 });
	
		pdfDoc.font(fontBold).text("Clinic info:", 7, 100);
		pdfDoc.font(fontNormal).text(sellerInfo.companyName, 7, 115, { width: 250 });
		pdfDoc.text(sellerInfo.street, 7, 130, { width: 250 });
		pdfDoc.text(sellerInfo.city, 7, 145, { width: 250 });
	
		pdfDoc.font(fontBold).text("Patient details:", 400, 100);
		pdfDoc.font(fontNormal).text(customerInfo.customerName, 400, 115, { width: 250 });
		pdfDoc.text(customerInfo.street, 400, 130, { width: 250 });
		pdfDoc.text(customerInfo.city, 400, 145, { width: 250 });
	
		pdfDoc.text("Order No:" + orderInfo.orderNo, 7, 195, { width: 250 });
		pdfDoc.text("Invoice No:" + orderInfo.invoiceNo, 7, 210, { width: 250 });
		pdfDoc.text("Clinic No:" + orderInfo.clinicId, 7, 225, { width: 250 });
		pdfDoc.text("Patient No:" + orderInfo.patientId, 7, 240, { width: 250 });
		pdfDoc.text("Date:" + orderInfo.invoiceDate + " " + orderInfo.invoiceTime, 7, 255, { width: 250 });
	
		pdfDoc.rect(7, 250, 560, 20).fill("#03bde6").stroke("#FC427B");
		pdfDoc.fillColor("#fff");
		pdfDoc.text("Service", 110, 256, { width: 190 });
		pdfDoc.text("Price", 400, 256, { width: 100 });
		pdfDoc.text("Total Price", 500, 256, { width: 100 });
		let productNo = 1;
		orderInfo.products.forEach((element) => {
			console.log("adding", element.name);
			let y = 256 + productNo * 20;
			pdfDoc.fillColor("#000");
			pdfDoc.text(element.name, 110, y, { width: 190 });
			pdfDoc.text(element.unitPrice, 400, y, { width: 100 });
			pdfDoc.text(element.totalPrice, 500, y, { width: 100 });
			productNo++;
		});
	
		pdfDoc
			.rect(7, 256 + productNo * 20, 560, 0.2)
			.fillColor("#000")
			.stroke("#000");
		productNo++;
	
		pdfDoc.font(fontBold).text("Total:", 400, 256 + productNo * 17);
		pdfDoc.font(fontBold).text(total, 500, 256 + productNo * 17);
		pdfDoc.end();
		console.log("pdf generate successfully");
		} catch (error) {
			console.log("Error occurred", error);
		}
	}
}