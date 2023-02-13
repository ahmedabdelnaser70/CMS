const express = require('express')

const router = express.Router();

var stripe = require('stripe')('sk_test_51MYaafJbL5zohfa0alEKFf75zLL7urT5MJHomVHjPdFPokPCaCzt4KOVpDe1jBMu4FoRrJqvPLko14nYF1jDFlBY00FtvGPQg2');
var Publishable_Key = 'pk_test_51MYaafJbL5zohfa0zpuoN9xtDjTYWA9zNmeoHOtmaOh0TkzIv2s0GZBeHqHojxPfRZXJIsR8V3X2q2mkUialqiPQ00sDMsKKEF'
var Secret_Key = 'sk_test_51MYaafJbL5zohfa0alEKFf75zLL7urT5MJHomVHjPdFPokPCaCzt4KOVpDe1jBMu4FoRrJqvPLko14nYF1jDFlBY00FtvGPQg2'

const { paymentPost} = require("../Controllers/payment");
const authenticatioMW = require('../Middlewares/authentication');



router.route("/payment")
	.post(authenticatioMW.checkPatientOrEmployee, paymentPost);

module.exports = router;
