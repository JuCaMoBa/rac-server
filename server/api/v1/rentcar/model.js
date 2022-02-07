const mongoose = require('mongoose');
const { body } = require('express-validator');

const sanitizers = [body('startTrip').escape(), body('endTrip').escape()];

const fields = {
  startTrip: {
    type: String,
    required: true,
  },
  endTrip: {
    type: String,
    required: true,
  },
};
const references = {
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  cars: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'cars',
    required: true,
  },
};

const rentCar = new mongoose.Schema(Object.assign(fields, references), {
  timestamps: true,
});

const model = mongoose.model('rentCar', rentCar);

module.exports = {
  Model: model,
  fields,
  references,
  sanitizers,
};
