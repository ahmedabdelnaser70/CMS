const mongoose = require("mongoose");
const AutoIncrement = require('mongoose-sequence')(mongoose);
const addressSchema = require("./address.js");

const schema = new mongoose.Schema({
	_id: {
		type: Number
	},
	location: {
		type: addressSchema.addressSchema,
		unique: true
	},
	mobilePhone: {
        type: String,
		unique: [true, 'Repeated Mobile Phone'],
        match: [
            /^01[0125][0-9]{8}$/,
            'Enter valid mobile phone number'
        ]
    },
	doctors: {
		type: Array,
		ref: 'doctors'
	},
	manager: {
		type: Number,
		ref: 'doctors'
	}
})

schema.plugin(AutoIncrement, {inc_field: '_id', start_seq: 1, id: 'Clinic_Id'});

mongoose.model("clinics", schema);