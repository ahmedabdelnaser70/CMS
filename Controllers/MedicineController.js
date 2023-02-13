//requires 
const mongoose = require("mongoose");
require("../Models/MedicineModel")

/*variables from require*/
//geeting schema from model
const medicineSchema = mongoose.model("medicines")


exports.getAllMedicines=(request,response,next)=>{
	let reqQuery = { ...request.query }; //using spread operator make any change on reqQuery wont affect request.query
    let querystr = JSON.stringify(reqQuery);
    querystr = querystr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
    let query = medicineSchema.find(JSON.parse(querystr));

    if (request.query.select) {
        let selectFields = request.query.select.split(',').join(' ');
        query = query.select(selectFields);
    }

    if (request.query.sort) {
        let sortFields = request.query.sort.split(',').join(' ');
        query = query.sort(sortFields);
    }
	query.then((data)=>{
            response.status(200).json(data);
        })
        .catch(error=>next(error))


}

exports.addMedicine=(request,response,next)=>{
	let medicineObject = new medicineSchema({
		name: request.body.name,
		description: request.body.description,
	})
	medicineObject.save()
	.then(result=>{
		response.status(201).json(result);
	})
	.catch( error=>next(error) ) 


}
//----------CRUD BY PARAM---------------------//.
exports.getMedicineByIdChild=(request,response,next)=>{
	medicineSchema.find({_id:request.params.id})
	.then((data)=>{
		if (data.length!==0) {
            response.status(201).json(data);
        } else {
            next(new Error("Medicine does not exist"));
        }	
	})
	.catch(error=>next(error))

}

exports.updateMedicineById=(request,response,next)=>{
	medicineSchema.updateOne(
		{
			_id:request.params.id
		},
		{
			$set:{
				name: request.body.name,
				description: request.body.description
			}
		}
	)
	.then(result=>{
		response.status(201).json({Message:" Medicnie succefully updated"});
	})
	.catch( error=>next(error) ) 


}

exports.deleteMedicineById=(request,response,next)=>{
	medicineSchema.deleteOne(
		{
			_id: request.params.id,
		}
	).then((result) => {
			response.status(201).json({Message:" Medicine succefully deleted"});
		})
		.catch((error) => next(error));
};