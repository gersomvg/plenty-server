const Joi = require('joi');
const {Model} = require('objection');

const Brand = require('../../models/brand');
const escapeWhereLikeInput = require('../../utils/escapeWhereLikeInput');
const getNextLink = require('../../utils/getNextLink');

module.exports = async (req, res) => {
    try {
        const querySchema = Joi.object().keys({
            name: Joi.string().allow(''),
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

        const query = Brand.query();
        if (req.query.name) {
            const likeString = `%${escapeWhereLikeInput(req.query.name)}%`;
            query.whereRaw('unaccent(name) ILIKE unaccent(?)', [likeString]);
        }
        query.range(offset, limit + offset - 1);
        const brands = await query;

        const nextLink = getNextLink({
            limit,
            offset,
            total: brands.total,
            path: '/v1/brand',
            params: req.query,
        });
        res.send({items: brands.results, nextLink});
    } catch (e) {
        console.error('❌  GET /brands: ', e.message);
        res.status(500).send({error: 'Something went wrong'});
    }
};
