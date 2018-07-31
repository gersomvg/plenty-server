const Ajv = require('ajv');

const authMiddleware = require('../../utils/authMiddleware');
const Brand = require('../../models/brand');

const validator = new Ajv({allErrors: true}).compile({
    type: 'object',
    properties: {name: {type: 'string', pattern: '\\S+', minLength: 1, maxLength: 255}},
    required: ['name'],
    additionalProperties: false,
});

module.exports = [
    authMiddleware('admin'),
    async (req, res) => {
        try {
            if (!validator(req.body)) return res.status(400).send({error: validator.errors});

            const insertedBrand = await Brand.query().insert({name: req.body.name.trim()});
            await Brand.knex().raw('REFRESH MATERIALIZED VIEW search_index');

            res.send(insertedBrand);
        } catch (e) {
            console.error('❌  POST /brand: ', e.message);
            res.status(500).send({error: 'Something went wrong'});
        }
    },
];
