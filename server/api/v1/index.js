const express = require('express');
const owners = require('./owners/routes');
const users = require('./users/routes');
const cars = require('./cars/routes');
const rentcar = require('./rentcar/routes');
const payments = require('./payments/routes');

const router = express.Router();

router.use('/owners', owners);
router.use('/users', users);
router.use('/cars', cars);
router.use('/rentcar', rentcar);
router.use('/payments', payments);

module.exports = router;
