const Joi = require('joi');

const Product = require('../../models/product');
const unaccent = require('../../utils/unaccent');
const escapeWhereLikeInput = require('../../utils/escapeWhereLikeInput');
const qs = require('../../utils/qs');

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
            const processedUserInput = escapeWhereLikeInput(unaccent(req.query.name));
            const likeString = `%${processedUserInput}%`;
            query.andWhere('name_unaccented', 'ilike', likeString);
        }
        if (req.query.shopCode) {
            query.innerJoin('productShop', 'product.id', 'productShop.productId');
            query.andWhere('productShop.shopCode', req.query.shopCode);
        }
        if (req.query.categoryId) {
            query.innerJoin('productCategory', 'product.id', 'productCategory.productId');
            query.andWhere('productCategory.categoryId', req.query.categoryId);
        }
        query.range(offset, limit + offset - 1).eager('[brand, shops, categories]');
        const products = await query;

        let nextLink;
        const hasNext = products.total > limit + offset;
        if (hasNext) {
            const params = qs.stringify({
                limit,
                offset: limit + offset,
                name: req.query.name,
            });
            nextLink = `${process.env.BASE_URL}/v1/product${params}`;
        }

        res.send({items: products.results, nextLink});
    } catch (e) {
        console.error('❌  GET /product: ', e.message);
        res.status(500).send({error: 'Something went wrong'});
    }
};
