const mongoose = require('mongoose');
const { body } = require('express-validator');

const sanitizers = [
  body('model').escape(),
  body('price').escape(),
  body('carphoto').escape(),
];

const fields = {
  model: {
    type: String,
    required: true,
    trim: true,
    maxLength: 255,
  },
  price: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  make: {
    type: String,
    required: true,
  },
  seats: {
    type: String,
    required: true,
  },
  doors: {
    type: String,
  },
  description: {
    type: String,
  },
  isRented: {
    type: Boolean,
    default: false,
  },
  carFrontPhoto: {
    type: String,
    default: '',
  },
  photo1: {
    type: String,
    default: '',
  },
  photo2: {
    type: String,
    default: '',
  },
  photo3: {
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
