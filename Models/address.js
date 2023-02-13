const mongoose = require("mongoose");

exports.addressSchema = new mongoose.Schema(
	{
		city: {
			type: mongoose.SchemaTypes.String,
			required: true,
			maxLength: [20, "city name cannot be more than 20 characters"]
		},
		street: {
			type: mongoose.SchemaTypes.String,
			required: true,
			minLength: [1, "street number must be > 1"]
		},
		building: {
			type: mongoose.SchemaTypes.Number,
			required: true,
			min: [1, "building number must be > 1"]
		}
	},
	{
		_id: false
	}
)