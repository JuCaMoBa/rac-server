const express = require('express');
const mongoose = require('mongoose');
const mercadopago = require('mercadopago');
const { Cars, Order } = require('./model');

mercadopago.configure({
  access_token: process.env.ACCESS_MP_TOKEN,
});
const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const order = await Order.find();
    res.json(order);
  } catch (e) {
    next(e);
  }
});

router.post('/', async (req, res, next) => {
  const { cars } = req.body;
  console.log(cars);
  try {
    for (let i = 0; i < cars.length; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      cars[i] = await Cars.findById(new mongoose.Types.ObjectId(cars[i])).lean();
    }
    console.log(cars);
    const order = await Order.create({ cars });
    const items = [{ title: cars.name, unit_price: cars.price, quantity: 1 }];

    console.log('sisepudo');
    // crear la preferencia de MercadoPago
    const { response } = await mercadopago.preferences.create({ items });
    console.log('sisepudo');
    res.json({ order, preferenceId: response.id });
    console.log('sisepudo');
  } catch (e) {
    next(e);
  }
});

module.exports = router;
