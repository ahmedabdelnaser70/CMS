const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

//address schema for patients
const addressSchema = require("./address");

// patient schema
const schema = new mongoose.Schema({
   _id: Number,
   firstName: { type: String, required: [true, "Add the patient first Name"] },
   lastName: { type: String, required: [true, "Add the patient last Name"] },
   age: { type: Number, require: [true, "Add the patient Age"] },
   address: {type: addressSchema.addressSchema},
   email: { type: String, required: true, unique: true, matches: [/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/, "Enter valid e-mail"] },
   password: { type: String, required: true, minlength: [5, "password length must be > 5"] },
   phone: { type: String, unique: true, matches: [/^01[0125][0-9]{8}$/, "Enter valid phone number"] },
   image: {
      type: String,
   },
});

schema.plugin(AutoIncrement, { id: "patient_id", inc_field: "_id", start_seq: 1 });
mongoose.model("patients", schema);
