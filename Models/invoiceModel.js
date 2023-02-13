const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

let schemaServices = new mongoose.Schema(
   {
      doctorId: {
         type: Number,
         required: true, 
         ref: "doctors"
      },
      price: {
         type: Number,
         required: true, 
      }
   },
   {
      _id: false,
   }
)

const schema = new mongoose.Schema({
   _id: { type: Number },
   clinicId: { type: Number, required: true,ref: "clinics"},
   patientId: { type: Number, required: true, ref: "patients"},
   services: [schemaServices],
   date: { type: String, required: true, default: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "numeric", year: "numeric" }) },
});

schema.plugin(AutoIncrement, { inc_field: "_id", start_seq: 1, id: "Invoice_Id" });
mongoose.model("invoices", schema);