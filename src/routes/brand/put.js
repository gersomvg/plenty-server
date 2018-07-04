const Ajv = require('ajv');

const authMiddleware = require('../../utils/authMiddleware');
const Brand = require('../../models/brand');

const validator = new Ajv({allErrors: true}).compile({
    type: 'object',
    properties: {name: {type: 'string', minLength: 1, maxLength: 255}},
    required: ['name'],
    additionalProperties: false,
});

module.exports = [
    authMiddleware('admin'),
    async (req, res) => {
        try {
            if (!validator(req.body)) return res.status(400).send({errors: validator.errors});

            const updatedBrand = await Brand.query().updateAndFetchById(req.params.id, {
                name: req.body.name,
            });

            if (!updatedBrand) {
                return res.status(404).send({error: 'No brand found for this id'});
            }

            res.send(updatedBrand);
        } catch (e) {
            console.error('❌  PUT /brand: ', e.message);
            res.status(500).send({error: 'Something went wrong'});
        }
    },
];
