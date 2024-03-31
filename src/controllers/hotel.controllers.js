const catchError = require('../utils/catchError');
const Hotel = require('../models/Hotel');
const Image = require('../models/Image');
const City = require('../models/City');
const Review = require('../models/Review');
const { Op } = require('sequelize');


const getAll = catchError(async(req, res) => {
    const {cityId , name} = req.query;
    const where = {};
    if (cityId) where.cityId = cityId;
    if (name) where.name ={[Op.iLike]:`%${name}%`}
    const results = await Hotel.findAll({
        include:[City, Image, Review],
        where:where
    });
    const hotelsWithRating = results.map(hotel => {
        const hotelJson = hotel.toJSON();
        let sum = 0;
        hotelJson.reviews.forEach(reviews => {
            sum += reviews.rating
        });
        const totalReviews = hotelJson.reviews.length;
        const average = totalReviews > 0 ? sum / totalReviews : 0;
        delete hotelJson.reviews;
        return{...hotelJson, rating: average}
    })



    return res.json(hotelsWithRating);
});

const create = catchError(async(req, res) => {
    const result = await Hotel.create(req.body);
    return res.status(201).json(result);
});

const getOne = catchError(async(req, res) => {
    const { id } = req.params;
    const result = await Hotel.findByPk(id,{include:[City, Image, Review]});
    if(!result) return res.sendStatus(404);
    const hotelJson = result.toJSON();
        let sum = 0;
        hotelJson.reviews.forEach(reviews => {
            sum += reviews.rating
        });
    const totlaReviews = hotelJson.reviews.length;
    const average = totlaReviews > 0 ? sum / totlaReviews : 0;
    delete hotelJson.reviews;
    return res.json({...hotelJson, rating: average})
});

const remove = catchError(async(req, res) => {
    const { id } = req.params;
    await Hotel.destroy({ where: {id} });
    return res.sendStatus(204);
});

const update = catchError(async(req, res) => {
    const { id } = req.params;
    const result = await Hotel.update(
        req.body,
        { where: {id}, returning: true }
    );
    if(result[0] === 0) return res.sendStatus(404);
    return res.json(result[1][0]);
});

module.exports = {
    getAll,
    create,
    getOne,
    remove,
    update
}