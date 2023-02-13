    const mongoose = require('mongoose');
    const AutoIncrement = require('mongoose-sequence')(mongoose);


    const medicineSchema = new mongoose.Schema({
    _id: {
        type:Number
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    }
    });



    //autu increament
    medicineSchema.plugin(AutoIncrement, {inc_field: '_id', start_seq: 1, id: 'Medicine_Id'});

    //create medicine collection name and apply medicine schema for it
    mongoose.model('medicines', medicineSchema);