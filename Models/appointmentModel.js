const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);


function formatDate(date) {
    return date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear();
}

const schema = mongoose.Schema({
    _id: {
        type: Number
    },
    clinic: {
        type: Number,
        ref: 'clinics',
        required: [true, 'the clinic reference is required']
    },
    doctorName: {
        type: Number,
        ref: 'doctors',
        required: [true, 'the doctor reference is required']
    },
    patient: {
        type: Number,
        ref: "patients",
        require: true
    },
    date: {
        type: String,
        match: [/^(0?[1-9]|[12][0-9]|3[01])[\/\-](0?[1-9]|1[012])[\/\-]\d{4}$/, 'Date must be like 31/02/2023'],
        required: [true, 'the date is required']
    },
    timeFrom: {
        type: String,
        match: [/((1[0-2]|0?[1-9]):([0-5][0-9]) ?([AaPp][Mm]))/, 'timeFrom must be like 8:30 am'],
        required: [true, 'timeFrom is required']
    },
    timeTo: {
        type: String,
        match: [/((1[0-2]|0?[1-9]):([0-5][0-9]) ?([AaPp][Mm]))/, 'timeTo must be like 8:30 am'],
        required: [true, 'timeTo is required']
    }
})

schema.plugin(AutoIncrement, {
    inc_field: '_id',
    start_seq: 1,
    id: 'Appointment_Id'
})

//setting the appointments collection in database
mongoose.model('appointments', schema);