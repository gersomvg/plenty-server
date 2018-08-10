const Ajv = require('ajv');

const Feedback = require('../../models/feedback');

const validator = new Ajv({allErrors: true}).compile({
    type: 'object',
    anyOf: [
        {
            properties: {
                message: {type: 'string', pattern: '\\S+', maxLength: 1000},
                barcode: {type: 'string', pattern: '\\S+', maxLength: 255},
            },
            required: ['message', 'barcode'],
            additionalProperties: false,
        },
        {
            properties: {
                message: {type: 'string', pattern: '\\S+', maxLength: 1000},
                productId: {type: 'integer'},
            },
            required: ['message', 'productId'],
            additionalProperties: false,
        },
        {
            properties: {
                message: {type: 'string', pattern: '\\S+', maxLength: 1000},
            },
            required: ['message'],
            additionalProperties: false,
        },
    ],
});

module.exports = async (req, res) => {
    try {
        if (!validator(req.body)) return res.status(400).send({error: validator.errors});

        let insertData = {message: req.body.message.trim()};
        if (req.body.productId) insertData.productId = Number(req.body.productId);
        else if (req.body.barcode) insertData.barcode = req.body.barcode;

        const insertedFeedback = await Feedback.query()
            .insert(insertData)
            .eager('[product, product.[brand, shops, categories, tags, barcodes]]');

        res.send(insertedFeedback);
    } catch (e) {
        console.error('❌  POST /feedback: ', e.message);
        res.status(500).send({error: 'Something went wrong'});
    }
};
