const Joi = require('joi');

const Category = require('../../models/category');

module.exports = async (req, res) => {
    try {
        const categories = await Category.query();

        res.send({items: categories});
    } catch (e) {
        console.error('❌  GET /categories: ', e.message);
        res.status(500).send({error: 'Something went wrong'});
    }
};
