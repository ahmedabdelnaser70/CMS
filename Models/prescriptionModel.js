const mongoose = require("mongoose");
const AutoIncrement = require('mongoose-sequence')(mongoose);

let medicineSchema = new mongoose.Schema(
	{
		medicineId: {
			type: Number,
			ref: "medicines",
			required: true		
		},
		quantity: {
			type: String,
			required: true
		},
		medicineDosage: {
			type: String,
			required: true
		}
		
	},
	{
		_id: false
	})
	

const schema = new mongoose.Schema({
	_id: {
		type: Number
	},
	clinic: {
		type: Number,
		ref: "clinics",
		required: true
	},	
	doctor: {
		type: Number,
		ref: "doctors",
		required: true
	},
	patient: {
		type: Number,
		ref: "patients",
		required: true
	},
	medicine: [{
		type: medicineSchema	
	}],
	notes: {
		type: String
	},
	date: {
		type: String,
		required: true
	},
	time: {
		type: String,
		required:true
	}
})

schema.plugin(AutoIncrement, {inc_field: '_id', start_seq: 1, id: 'Presciption_Id'});

mongoose.model("presciptions", schema);