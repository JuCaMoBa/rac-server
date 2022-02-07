const express = require('express');
const controller = require('./controller');
const { auth } = require('../auth');

const router = express.Router({
  mergeParams: true,
});

router
  .route('/')
  .get(controller.parentId, controller.all)
  .post(controller.parentId, auth, controller.create);

router.param('id', controller.id);
router.route('/:id').get(controller.parentId, controller.read);

module.exports = router;
