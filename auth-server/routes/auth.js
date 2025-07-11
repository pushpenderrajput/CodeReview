const express = require('express');
const router = express.Router();
const { requestOTP } = require('../controllers/authController');

router.post('/request-otp', requestOTP);

module.exports = router;
