const express = require('express');

const router = express.Router();


router.route('/').get(function (req, res) {
    res.send('My Server con express de Api owner')  
  });


module.exports = router;