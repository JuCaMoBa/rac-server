const mongoose = require('mongoose');
const { body } = require('express-validator');

const sanitizers = [
  body('modelcar').escape(),
  body('price').escape(),
  body('carphoto').escape(),
];

const fields = {
  modelcar: {
    type: String,
    required: true,
    trim: true,
    maxLength: 255,
  },
  price: {
    type: Number,
    required: true,
  },
  carphoto: {
    type: String,
    default: '',
  },
};

const references = {
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'owner',
    required: true,
  },
};

// const virtuals = {
//   rating: {
//     ref: '',
//     localField: '_id',
//     foreignField: 'car',
//   },
// };

const cars = new mongoose.Schema(Object.assign(fields, references), {
  timestamps: true,
  toJSON: {
    virtuals: true,
  },
});

const model = mongoose.model('cars', cars);

module.exports = {
  Model: model,
  fields,
  references,
  sanitizers,
};
