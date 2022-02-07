const express = require('express');
const { sanitizers } = require('./model');
const controller = require('./controller');
const { auth } = require('../auth');
const rentcar = require('../rentcar/routes');

const router = express.Router({
  mergeParams: true,
});

/*

 * /api/users/signin     POST   - Signin
 * /api/users/signup     POST   - Signup
 * /api/users/profile    GET    - Get the profile of the current user
 * /api/users/profile    PUT    - Update the profile of the current user
 *
 */

router.route('/signin').post(controller.signin);
// router.route('/initSignUp').post(sanitizers, controller.initSignup);
router.route('/signup').post(sanitizers, controller.signup);
// router.route('/resendEmail').post(controller.resendEmail);
router
  .route('/profile')
  .get(auth, controller.profile)
  .put(auth, controller.update)
  .patch(auth, controller.update);

router
  .route('/profile/photo')
  .put(auth, controller.updatePhoto)
  .patch(auth, controller.updatePhoto);

router.param('id', controller.id);
router.route('/:id').get(auth, controller.read);

router.use('/:user/rentcar', rentcar);
module.exports = router;
