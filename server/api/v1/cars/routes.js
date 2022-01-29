const express = require('express');
const controller = require('./controller');
const { auth, owner } = require('../auth');
const { sanitizers } = require('./model');

const router = express.Router({
  mergeParams: true,
});

/*
 * /api/cars        GET    - Get all Car
 * /api/cars        POST   - Create a new Car
 * /api/cars/:id    PUT    - Update a car
 * /api/cars/:id    DELETE - Delete a car
 *
 */

router
  .route('/')
  .get(controller.parentId, controller.all)
  .post(controller.parentId, auth, sanitizers, controller.create);

router.param('id', controller.id);

router
  .route('/:id')
  .put(controller.parentId, auth, owner, sanitizers, controller.update)
  .patch(controller.parentId, auth, owner, sanitizers, controller.update)
  .delete(controller.parentId, auth, owner, controller.delete);

module.exports = router;
