const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);


const reportSchema = new mongoose.Schema({
_id: {
    type:Number
},
name: {
    type: String,
    required: true,

}

});


//autu increament
reportSchema.plugin(AutoIncrement, {inc_field: '_id', start_seq: 1, id: 'Report_Id'});

//create medicine collection name and apply medicine schema for it
mongoose.model('reports', reportSchema);



  
  