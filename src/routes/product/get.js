const Ajv = require('ajv');

const Product = require('../../models/product');
const escapeWhereLikeInput = require('../../utils/escapeWhereLikeInput');
const getNextLink = require('../../utils/getNextLink');

const validator = new Ajv({allErrors: true}).compile({
    type: 'object',
    properties: {
        name: {type: 'string', maxLength: 255},
        categoryId: {type: 'string', pattern: '^\\d*$'},
        shopCode: {type: 'string', pattern: '^[a-z]*$'},
        limit: {type: 'string', pattern: '^\\d{1,2}$'},
        offset: {type: 'string', pattern: '^\\d+$'},
        classifications: {type: 'string', pattern: '^((YES|MAYBE|NO)(,(YES|MAYBE|NO))*)?$'},
    },
    additionalProperties: false,
});

module.exports = async (req, res) => {
    try {
        if (!validator(req.query)) return res.status(400).send({error: validator.errors});

        const limit = Number(req.query.limit || 25);
        const offset = Number(req.query.offset || 0);

        const query = Product.query();
        if (req.query.name) {
            const likeString = `%${escapeWhereLikeInput(req.query.name)}%`;
            query.whereRaw('unaccent(name) ILIKE unaccent(?)', [likeString]);
        }
        if (req.query.classifications) {
            const classifications = req.query.classifications.split(',');
            query.whereIn('classification', classifications);
        }
        if (req.query.shopCode) {
            query.innerJoin('productShop', 'product.id', 'productShop.productId');
            query.where('productShop.shopCode', req.query.shopCode);
        }
        if (req.query.categoryId) {
            query.innerJoin('productCategory', 'product.id', 'productCategory.productId');
            query.where('productCategory.categoryId', req.query.categoryId);
        }
        query
            .range(offset, limit + offset - 1)
            .eager('[brand, shops, categories, barcodes]')
            .orderBy('createdAt', 'desc')
            .orderBy('updatedAt', 'desc');
        const products = await query;

        const nextLink = getNextLink({
            limit,
            offset,
            total: products.total,
            path: '/v1/product',
            params: req.query,
        });
        res.send({items: products.results, nextLink});
    } catch (e) {
        console.error('❌  GET /product: ', e.message);
        res.status(500).send({error: 'Something went wrong'});
    }
};
