const Ajv = require('ajv');

const authMiddleware = require('../../utils/authMiddleware');
const getAhList = require('./supermarkets/ahList');
const getJumboList = require('./supermarkets/jumboList');

const validator = new Ajv({allErrors: true}).compile({
    type: 'object',
    properties: {
        name: {type: 'string', pattern: '\\S+', maxLength: 255},
    },
    required: ['name'],
    additionalProperties: false,
});

module.exports = [
    authMiddleware('admin'),
    async (req, res) => {
        if (!validator(req.query)) return res.status(400).send({error: validator.errors});
        try {
            const searchQuery = req.query.name;
            const [ah, jumbo] = await Promise.all([
                getAhList({searchQuery}),
                getJumboList({searchQuery}),
            ]);
            res.send({ah, jumbo});
        } catch (e) {
            console.error('❌  GET /scrape: ', e.message);
            res.status(500).send({error: 'Something went wrong'});
        }
    },
];
