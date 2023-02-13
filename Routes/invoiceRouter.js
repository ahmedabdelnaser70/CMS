const express = require("express");
const router = express.Router();
const { invoicePost, invoicePatch, checkParamid } = require("../Middlewares/invoiceValidation");
const validator = require("../Middlewares/errorValidator");
const controller = require("../Controllers/invoiceController");
const authenticatioMW = require('../Middlewares/authentication');
module.exports = router;

router.route("/invoices")
	.all(authenticatioMW.checkAdmin)
	.post(invoicePost, validator, controller.addInvoice)
	.patch(invoicePatch, validator, controller.updateInvoice);

router.route("/invoices/:id")
	.all(authenticatioMW.checkAdmin, checkParamid, validator)
	.get(controller.getInvoiceByID)
	.patch(invoicePatch, controller.updateInvoice)
	.delete(controller.deleteInvoice);