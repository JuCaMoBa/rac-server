const express = require('express');
const { sanitizers } = require('./model');
const controller = require('./controller');

const router = express.Router();

/*
 
 * /api/owners/signin     POST   - Signin
 * /api/owners/signup     POST   - Signup
 * /api/owners/profile    GET    - Get the profile of the current user
 * /api/owners/profile    PUT    - Update the profile of the current user
 *
 */

router.route('/signin').post(controller.signin);
router.route('/signup').post(sanitizers, controller.signup);



module.exports = router;