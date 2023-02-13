const express = require('express');
const controller = require('../Controllers/loginController');
const router = express.Router();


router.route('/login')
.post(controller.login);

module.exports = router;