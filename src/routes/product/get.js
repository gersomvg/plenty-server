const Joi = require('joi');
const crypto = require('crypto');

const Product = require('../../models/product');
const escapeWhereLikeInput = require('../../utils/escapeWhereLikeInput');
const getNextLink = require('../../utils/getNextLink');

module.exports = async (req, res) => {
    try {
        const querySchema = Joi.object().keys({
            name: Joi.string().allow(''),
            categoryId: Joi.number().integer(),
            shopCode: Joi.string()
                .alphanum()
                .max(32),
            limit: Joi.number()
                .integer()
                .min(1)
                .max(100),
            offset: Joi.number().integer(),
        });
        const validation = Joi.validate(req.query, querySchema);
        if (validation.error) {
            return res.status(400).send({error: 'Invalid query parameters provided'});
        }

        const limit = Number(req.query.limit || 25);
        const offset = Number(req.query.offset || 0);

        const query = Product.query();
        if (req.query.name) {
            const likeString = `%${escapeWhereLikeInput(req.query.name)}%`;
            query.whereRaw('unaccent(name) ILIKE unaccent(?)', [likeString]);
        }
        if (req.query.shopCode) {
            query.innerJoin('productShop', 'product.id', 'productShop.productId');
            query.andWhere('productShop.shopCode', req.query.shopCode);
        }
        if (req.query.categoryId) {
            query.innerJoin('productCategory', 'product.id', 'productCategory.productId');
            query.andWhere('productCategory.categoryId', req.query.categoryId);
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
