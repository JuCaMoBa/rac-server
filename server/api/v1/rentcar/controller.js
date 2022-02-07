const { Model, references } = require('./model');
const { Model: Users } = require('../users/model');
const { Model: Cars } = require('../cars/model');
const { filterByNested } = require('../../../utils/utils');

const referencesNames = Object.getOwnPropertyNames(references);
exports.parentId = async (req, res, next) => {
  const { params = {} } = req;
  const { user = '' } = params;

  if (user) {
    const data = await Users.findById(user).exec();
    if (data) {
      next();
    } else {
      const message = 'User not found';
      next({
        message,
        statusCode: 404,
        level: 'error',
      });
    }
  } else {
    next();
  }
};
exports.id = async (req, res, next) => {
  const { params = {} } = req;
  const { id = '' } = params;

  try {
    const data = await Model.findById(id);
    if (!data) {
      const message = `${Model.modelName} not found`;
      next({
        message,
        statusCode: 404,
        level: 'warn',
      });
    } else {
      req.doc = data;
      next();
    }
  } catch (error) {
    next(error);
  }
};

exports.all = async (req, res, next) => {
  const { params } = req;
  const { filters, populate } = filterByNested(params, referencesNames);

  try {
    const data = await Model.find(filters).populate(populate);

    res.json({
      data,
    });
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  const { body = {}, decoded } = req;
  const { id } = decoded;

  const { cars: carID } = body;
  const user = await Users.findById(id).exec();
  if (!user) {
    next({
      message: 'Only users can rent cars',
      statusCode: 401,
    });
  }
  await Cars.findByIdAndUpdate(carID, { isRented: true });

  const document = new Model({
    ...body,
    user: id,
  });
  try {
    const data = await document.save();
    const status = 200;
    res.status(status);
    res.json({
      data,
    });
  } catch (error) {
    next(error);
  }
};
exports.read = async (req, res, next) => {
  const { doc = {} } = req;

  res.json({
    data: doc,
  });
};
