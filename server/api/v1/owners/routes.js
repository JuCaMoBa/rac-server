const express = require('express');
const { sanitizers } = require('./model');
const controller = require('./controller');
const { auth } = require('../auth');
const carsRouter = require('../cars/routes');

const router = express.Router();

/*

 * /api/owners/signin     POST   - Signin
 * /api/owners/signup     POST   - Signup
 * /api/owners/profile    GET    - Get the profile of the current user
 * /api/owners/profile    PUT    - Update the profile of the current user
 *
 */

router.route('/signin').post(controller.signin);
router.route('/initSignUp').post(sanitizers, controller.initSignup);
router.route('/signup').post(controller.signUp);

router
  .route('/profile')
  .get(auth, controller.profile)
  .put(auth, controller.update)
  .patch(auth, controller.update);

router.param('id', controller.id);
router.route('/:id').get(auth, controller.read);

router.use('/:owner/cars', carsRouter);

module.exports = router;
