const mongoose = require('mongoose');
// const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('../Models/usersModel');
const UserSchema = mongoose.model('users');
exports.login = (request, response, next) => {

    //check if he is the admin
    UserSchema.findOne({email: request.body.email}, {_id: 0, __v: 0}).then(function(data) {
        if(data != null) {
            // if (bcrypt.compareSync(request.body.password, data.password)) {
            if(data.password == request.body.password) {
                let token = jwt.sign({role: data.role, id: data.userId}, process.env.SECRET_KEY, {expiresIn: "1h"});
                let newResponse = {data};
                newResponse.token = token;
                response.status(200).json(newResponse);
            }
            else {
                let error = new Error("Your email or password is incorrect");
                error.status = 401
                next(error);
            }
        }
        else {
            let error = new Error("Your email or password is incorrect");
            error.status = 401
            next(error);
        }
    })
}