const Product = require('../../models/product');
const unaccent = require('../../utils/unaccent');
const escapeWhereLikeInput = require('../../utils/escapeWhereLikeInput');

const processUserInput = string => escapeWhereLikeInput(unaccent(string));
const getLikeString = string => (string ? `%${processUserInput(string)}%` : '%%');

module.exports = async (req, res) => {
    try {
        const products = await Product.query()
            .where('name_unaccented', 'ilike', getLikeString(req.query.name))
            .eager('brand');
        res.send({items: products});
    } catch (e) {
        console.error('❌  GET /product: ', e.message);
        res.status(500).send({error: 'Something went wrong'});
    }
};
