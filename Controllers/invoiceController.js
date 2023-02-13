const mongoose = require("mongoose");
require("../Models/invoiceModel");
const invoiceSchema = mongoose.model("invoices");
let easyinvoice = require("easyinvoice");
const pdfKit = require("pdfkit");
let fs = require("fs");

exports.getInvoiceByID = async (request, response, next) => {
   invoiceSchema
      .findOne({ _id: request.params.id }, { __v: 0 })
      .populate({ path: "patientId", select: { email: 0, password: 0, __v: 0 } })
      .populate({ path: "clinicId", select: { email: 0, password: 0, __v: 0, doctors: 0 } })
      .populate({ path: "services.doctorId", select: { _id: 0, specialty: 1 } })
      .then((res) => {
         if (res) {
            createPdf(res);
            response.status(200).json(res);
         } else next(new Error("invoices doesn't exist"));
      })
      .catch((error) => next(error));
};

exports.addInvoice = async (request, response, next) => {
   let newInvoice = new invoiceSchema({
      _id: request.params.id,
      clinicId: request.body.clinicId,
      patientId: request.body.patientId,
      services: request.body.services,
   });
   await newInvoice
      .save()
      .then((result) => {
         response.status(200).json(result);
      })
      .catch((error) => next(error));
};

exports.updateInvoice = (request, response, next) => {
   invoiceSchema.findOne({ _id: request.params.id }, { _id: 1 }).then(function (data) {
      if (data != null) {
         invoiceSchema
            .updateOne(
               { _id: request.params.id },
               {
                  $set: {
                     clinicId: request.body.clinicId,
                     patientId: request.body.patientId,
                     services: request.body.services,
                  },
               }
            )
            .then((result) => {
               if (result.modifiedCount == 0) {
                  response.status(200).json({ Updated: true, Message: "Nothing is changed" });
               } else {
                  response.status(200).json({ Updated: true, Message: "Invoice is updated successfully" });
               }
            })
            .catch((error) => next(error));
      } else {
         next(new Error("This Invoice not found"));
      }
   });
};

exports.deleteInvoice = (request, response, next) => {
   invoiceSchema
      .deleteOne({ _id: request.params.id })
      .then((result) => {
         if (result.acknowledged && result.deletedCount == 1) {
            response.status(200).json({ Deleted: true, Message: "This Invoice is deleted successfully" });
         } else {
            response.status(200).json({ Deleted: false, Message: "This Invoice is not found" });
         }
      })
      .catch((error) => next(error));
};

function createPdf(res) {
   try {
      let clinicLogo = "./images/clinicLogo.png";
      let fileName = "./InvoicesPdf/invoice" + res._id + ".pdf";
      let fontNormal = "Helvetica";
      let fontBold = "Helvetica-Bold";
      let total = 0;
      let services = [];
      for (let i = 0; i < res.services.length; i++) {
         services.push({
            id: res._id,
            name: res.services[i].doctorId[0].specialty,
            company: "Acer",
            unitPrice: res.services[i].price,
            totalPrice: res.services[i].price,
            qty: 1,
         });
         total += 1 * res.services[i].price;
      }

      let sellerInfo = {
         companyName: "iti clinic",
         city: res.clinicId.location.city,
         street: res.clinicId.location.street,
         country: "Egypt",
         contactNo: res.clinicId.mobilePhone,
      };

      let customerInfo = {
         customerName: res.patientId.firstName + " " + res.patientId.lastName,
         city: res.patientId.address.city,
         street: res.patientId.address.street,
         country: "Egypt",
         contactNo: res.patientId.phone,
      };

      let orderInfo = {
         orderNo: res._id,
         invoiceNo: res._id,
         clinicId: res.clinicId._id,
         patientId: res.patientId._id,
         invoiceDate: res.date,
         invoiceTime: "10:57:00 PM",
         products: services,
         totalValue: total,
      };

      let pdfDoc = new pdfKit();
      let stream = fs.createWriteStream(fileName);
      pdfDoc.pipe(stream);

      pdfDoc.text("Clinic", 5, 5, { align: "center", width: 600 });
      pdfDoc.image(clinicLogo, 25, 20, { width: 50, height: 50 });
      pdfDoc.font(fontBold).text("ITI CLINICS", 7, 75);
      pdfDoc.font(fontNormal).fontSize(14).text("Order Invoice/Bill Receipt", 400, 30, { width: 200 });
      pdfDoc.fontSize(10).text(res.date, 400, 46, { width: 200 });

      pdfDoc.font(fontBold).text("Clinic:", 7, 100);
      pdfDoc.font(fontNormal).text(sellerInfo.companyName, 7, 115, { width: 250 });
      pdfDoc.text(sellerInfo.street, 7, 130, { width: 250 });
      pdfDoc.text(sellerInfo.city, 7, 145, { width: 250 });

      pdfDoc.font(fontBold).text("Patient details:", 400, 100);
      pdfDoc.font(fontNormal).text(customerInfo.customerName, 400, 115, { width: 250 });
      pdfDoc.text(customerInfo.street, 400, 130, { width: 250 });
      pdfDoc.text(customerInfo.city, 400, 145, { width: 250 });

      pdfDoc.text("Order No:" + orderInfo.orderNo, 7, 195, { width: 250 });
      pdfDoc.text("Invoice No:" + orderInfo.invoiceNo, 7, 210, { width: 250 });
      pdfDoc.text("Clinic No:" + orderInfo.clinicId, 7, 225, { width: 250 });
      pdfDoc.text("Patient No:" + orderInfo.patientId, 7, 240, { width: 250 });
      pdfDoc.text("Date:" + orderInfo.invoiceDate + " " + orderInfo.invoiceTime, 7, 255, { width: 250 });

      pdfDoc.rect(7, 250, 560, 20).fill("#03bde6").stroke("#FC427B");
      pdfDoc.fillColor("#fff");
      pdfDoc.text("Product", 110, 256, { width: 190 });
      pdfDoc.text("Qty", 300, 256, { width: 100 });
      pdfDoc.text("Price", 400, 256, { width: 100 });
      pdfDoc.text("Total Price", 500, 256, { width: 100 });

      let productNo = 1;
      orderInfo.products.forEach((element) => {
         console.log("adding", element.name);
         let y = 256 + productNo * 20;
         pdfDoc.fillColor("#000");
         pdfDoc.text(element.name, 110, y, { width: 190 });
         pdfDoc.text(element.qty, 300, y, { width: 100 });
         pdfDoc.text(element.unitPrice, 400, y, { width: 100 });
         pdfDoc.text(element.totalPrice, 500, y, { width: 100 });
         productNo++;
      });

      pdfDoc
         .rect(7, 256 + productNo * 20, 560, 0.2)
         .fillColor("#000")
         .stroke("#000");
      productNo++;

      pdfDoc.font(fontBold).text("Total:", 400, 256 + productNo * 17);
      pdfDoc.font(fontBold).text(total, 500, 256 + productNo * 17);

      pdfDoc.end();
      console.log("pdf generate successfully");
   } catch (error) {
      console.log("Error occurred", error);
   }
}