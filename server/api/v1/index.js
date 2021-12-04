const express = require('express');
const owner =require('./owner/routes');
const users =require('./users/routes');

const router = express.Router();

router.use('/owner', owner);
router.use('/users', users);

module.exports = router;
