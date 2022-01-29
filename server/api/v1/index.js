const express = require('express');
const owners = require('./owners/routes');
const users = require('./users/routes');
const cars = require('cars/routes');

const router = express.Router();

router.use('/owners', owners);
router.use('/users', users);
router.use('/cars', cars);

module.exports = router;
