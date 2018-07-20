const Ajv = require('ajv');
const {Model} = require('objection');

const authMiddleware = require('../../utils/authMiddleware');
const Feedback = require('../../models/feedback');
const getNextLink = require('../../utils/getNextLink');

const validator = new Ajv({allErrors: true}).compile({
    type: 'object',
    properties: {
        archived: {type: 'string', pattern: '^(true|false)$'},
        limit: {type: 'string', pattern: '^\\d{1,2}$'},
        offset: {type: 'string', pattern: '^\\d+$'},
    },
    required: ['archived'],
    additionalProperties: false,
});

module.exports = [
    authMiddleware('admin'),
    async (req, res) => {
        try {
            if (!validator(req.query)) return res.status(400).send({error: validator.errors});

            const limit = Number(req.query.limit || 25);
            const offset = Number(req.query.offset || 0);

            const feedbacks = await Feedback.query()
                .where({archived: req.query.archived === 'true'})
                .range(offset, limit + offset - 1);

            const nextLink = getNextLink({
                limit,
                offset,
                total: feedbacks.total,
                path: '/v1/feedback',
                params: req.query,
            });
            res.send({items: feedbacks.results, nextLink});
        } catch (e) {
            console.error('❌  GET /feedback: ', e.message);
            res.status(500).send({error: 'Something went wrong'});
        }
    },
];
