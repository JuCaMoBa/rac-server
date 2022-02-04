const mongoose = require('mongoose');

const schema1 = new mongoose.Schema({
  name: String,
  price: Number,
});

const schema2 = new mongoose.Schema({
  date: { type: Date, default: () => new Date() },
  status: { type: String, enum: ['created', 'payed', 'cancelled', 'delivered'], default: 'created' },
  cars: [
    {
      name: String,
      price: Number,
    },
  ],
});

const Car = mongoose.model('Car', schema1);
const Order = mongoose.model('Order', schema2);

module.exports = { Car, Order };
