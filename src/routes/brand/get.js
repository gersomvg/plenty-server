const Ajv = require('ajv');
const {Model} = require('objection');

const authMiddleware = require('../../utils/authMiddleware');
const Brand = require('../../models/brand');
const escapeWhereLikeInput = require('../../utils/escapeWhereLikeInput');
const getNextLink = require('../../utils/getNextLink');

const validator = new Ajv({allErrors: true}).compile({
    type: 'object',
    properties: {
        name: {type: 'string', maxLength: 255},
        limit: {type: 'string', pattern: '^\\d{1,2}$'},
        offset: {type: 'string', pattern: '^\\d+$'},
    },
    additionalProperties: false,
});

module.exports = [
    authMiddleware('admin'),
    async (req, res) => {
        try {
            if (!validator(req.query)) return res.status(400).send({error: validator.errors});

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
            console.error('❌  GET /brand: ', e.message);
            res.status(500).send({error: 'Something went wrong'});
        }
    },
];
