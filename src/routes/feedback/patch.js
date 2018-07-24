const Ajv = require('ajv');

const authMiddleware = require('../../utils/authMiddleware');
const Feedback = require('../../models/feedback');

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
            const feedbackId = Number(req.params.id);
            if (Number.isNaN(feedbackId))
                return res.status(400).send({error: 'ID must be an integer'});

            const updatedFeedback = await Feedback.query()
                .patchAndFetchById(feedbackId, {
                    archived: req.body.archived === 'true',
                })
                .eager('[product, product.[brand, shops, categories, barcodes]]');

            if (!updatedFeedback) {
                return res.status(404).send({error: 'No feedback found for this id'});
            }

            res.send(updatedFeedback);
        } catch (e) {
            console.error('❌  PATCH /feedback: ', e.message);
            res.status(500).send({error: 'Something went wrong'});
        }
    },
];
