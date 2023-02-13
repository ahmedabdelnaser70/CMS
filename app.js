const express = require("express");
const app = express();
const mongoose = require("mongoose"); //1
const doctorRouter = require("./Routes/doctorRoute");
const patientRouter = require("./Routes/patientRoutes"); //Ahmed Abdelnaser
const clinicRouter = require("./Routes/clinicRoutes");
const appointmentRouter = require("./Routes/appointmentRoute");
const  medicineRoutes = require('./Routes/MedicineRoute');
const employeeRouter = require("./Routes/employeeRouter");
const loginRouter = require('./Routes/loginRoute');
const paymentRouter = require('./Routes/payment');
const authenticatioMW = require('./Middlewares/authentication');
const presciptionRouter = require("./Routes/prescriptionRoutes");
const reportRouter = require("./Routes/reportRoute");
const invoiceRouter = require("./Routes/invoiceRouter");
const morgan = require("morgan");
// const loginRouter = require("./Routes/login")
// const checkToken = require("./Middelwares/authorization")

require("dotenv").config();
let port = process.env.PORT || 8080;
mongoose.set("strictQuery", true); //2
// emitter.setMaxListeners()
mongoose
   .connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
   }) //3
   .then(function () {
      //4
      console.log("DB is connected");
      app.listen(port, () => {
         // to start Node server after DB connection start
         console.log("Listening", port);
      });
   })
   .catch(function (error) {
      //5
      console.log("DB Problem" + error);
   });

app.use(express.json()); // to ready and json object write in body

//Authontication
// app.use(loginRouter)

//Authorization
// app.use(checkToken)

//first layer
const fs = require('fs')
app.use(
	morgan("tiny", {
		stream: fs.createWriteStream("./access.log", {
			flags: "a", // to continue writting on what exist in the file
		}),
	})
);

/*
   register route
*/

//login layer
app.use(loginRouter);

//check if request contains a token
app.use(authenticatioMW.authentication);

//Second Middleware
app.use(clinicRouter);
app.use(doctorRouter);
app.use(patientRouter); //Ahmed Abdelnasers
app.use(appointmentRouter);
app.use(medicineRoutes);
app.use(employeeRouter);
app.use(presciptionRouter);
app.use(reportRouter);
app.use(paymentRouter);
app.use(invoiceRouter);


//Third Middleware
app.use((request, response, next) => {
   response.status(404).json({Data: "Not Found"});
});

// Error MiddleWare
app.use((error, request, response, next) => {
   const status = error.status || 500
   response.status(status).json({message: "Error " + error});
});
