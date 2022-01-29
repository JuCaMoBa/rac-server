const { filterByNested } = require('../../../utils');
const { Model, fields, references } = require('./model');
const { Model: User } = require('../users/model');

const referencesNames = [...Object.getOwnPropertyNames(references)];

exports.parentId = async (req, res, next) => {
  const { params = {} } = req;
  const { user = '' } = params;

  if (user) {
    const data = await User.findById(user).exec();
    if (data) {
      next();
    } else {
      const message = 'User not found';
      next({
        message,
        statusCode: 404,
        level: 'warn',
      });
    }
  } else {
    next();
  }
};

exports.id = async (req, res, next) => {
  const { params = {} } = req;
  const { id = '' } = params;
  const { populate } = filterByNested(params, referencesNames);

  try {
    const data = await Model.findById(id).populate(populate);
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

  const { filters, populate } = filterByNested(params, updatedReferencesNames);

  const docs = Model.find(filters).populate(populate);
  const all = Model.countDocuments(filters);

  try {
    const response = await Promise.all([docs.exec(), all.exec()]);
    const [data] = response;

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

  const document = new Model({
    ...body,
    user: id,
  });

  try {
    const data = await document.save();
    const status = 201;
    res.status(status);
    res.json({
      data,
    });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  const { doc = {}, body = {} } = req;

  Object.assign(doc, body);
  try {
    const data = await doc.save();
    res.json({
      data,
    });
  } catch (error) {
    next(error);
  }
};

exports.delete = async (req, res, next) => {
  const { doc = {} } = req;
  try {
    const data = await doc.remove();
    res.json({
      data,
    });
  } catch (error) {
    next(error);
  }
};
