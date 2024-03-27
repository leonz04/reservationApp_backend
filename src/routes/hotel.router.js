const { getAll, create, getOne, remove, update } = require('../controllers/hotel.controllers');
const express = require('express');

const hotelRouter = express.Router();

hotelRouter.route('/hotels')
    .get(getAll)
    .post(create);

hotelRouter.route('/hotels/:id')
    .get(getOne)
    .delete(remove)
    .put(update);

module.exports = hotelRouter;