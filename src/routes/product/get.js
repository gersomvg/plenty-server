const Product = require('../../models/product');
const unaccent = require('../../utils/unaccent');
const escapeWhereLikeInput = require('../../utils/escapeWhereLikeInput');

const processUserInput = string => escapeWhereLikeInput(unaccent(string));

module.exports = async (req, res) => {
    try {
        const products = await Product.query()
            .where('name_unaccented', 'ilike', `%${processUserInput(req.query.name)}%`)
            .skipUndefined()
            .eager('brand');
        res.send({items: products});
    } catch (e) {
        console.error('❌  GET /product: ', e.message);
        res.status(500).send({error: 'Something went wrong'});
    }
};
