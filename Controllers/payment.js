const mongoose = require("mongoose");
require("../Models/invoiceModel");
const invoiceSchema = mongoose.model("invoices");

var Secret_Key = "sk_test_51MYaafJbL5zohfa0alEKFf75zLL7urT5MJHomVHjPdFPokPCaCzt4KOVpDe1jBMu4FoRrJqvPLko14nYF1jDFlBY00FtvGPQg2";
var stripe = require("stripe")(Secret_Key);
//var Publishable_Key = 'pk_test_51MYaafJbL5zohfa0zpuoN9xtDjTYWA9zNmeoHOtmaOh0TkzIv2s0GZBeHqHojxPfRZXJIsR8V3X2q2mkUialqiPQ00sDMsKKEF'

exports.paymentPost = async (request, response, next) => {
   const token = await stripe.tokens.create({
      card: {
         number: "4242424242424242",
         exp_month: 2,
         exp_year: 2024,
         cvc: "314",
      },
   });

   stripe.customers
      .create({
         email: "waleed@gmail.com",
         source: token.id,
         name: "Gourav Hammad",
         address: {
            line1: "TC 9/4 Old MES colony",
            postal_code: "452331",
            city: "Assiut",
            state: "Madhya Pradesh",
            country: "Egypt",
         },
      })
      .then((customer) => {
         return stripe.charges.create({
            amount: 2500, // Charging Rs 25
            description: "Node Project",
            currency: "USD",
            customer: customer.id,
         });
      })
      .then(async (charge) => {
         // If no error occurs
         let newInvoice = new invoiceSchema({
            clinicId: 5,
            patientId: 1,
            services: [{ doctorId: 1, price: charge.amount }],
            quantity: 2,
            total: charge.amount,
         });
         await newInvoice
            .save()
            .then((result) => {
               response.send("Success");
            })
            .catch((error) => next(error));
      })
      .catch((err) => {
         response.send(err); // If some error occurs
      });
};