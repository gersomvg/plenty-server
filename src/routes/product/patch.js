const Ajv = require('ajv');

const authMiddleware = require('../../utils/authMiddleware');
const Product = require('../../models/product');

const validator = new Ajv({allErrors: true}).compile({
    type: 'object',
    properties: {archived: {type: 'boolean'}},
    required: ['archived'],
    additionalProperties: false,
});

module.exports = [
    authMiddleware('admin'),
    async (req, res) => {
        try {
            if (!validator(req.body)) return res.status(400).send({error: validator.errors});
            const productId = Number(req.params.id);
            if (Number.isNaN(productId))
                return res.status(400).send({error: 'ID must be an integer'});

            const updatedProduct = await Product.query()
                .patchAndFetchById(productId, {
                    archived: req.body.archived,
                })
                .eager('[brand, shops, categories, tags, barcodes]');

            if (!updatedProduct) {
                return res.status(404).send({error: 'No product found for this id'});
            }

            res.send(updatedProduct);
        } catch (e) {
            console.error('❌  PATCH /product: ', e.message);
            res.status(500).send({error: 'Something went wrong'});
        }
    },
];
