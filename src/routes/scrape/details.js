const Ajv = require('ajv');

const authMiddleware = require('../../utils/authMiddleware');
const getAhDetails = require('./supermarkets/ahDetails');
const getJumboDetails = require('./supermarkets/jumboDetails');

const validator = new Ajv({allErrors: true}).compile({
    type: 'object',
    properties: {
        url: {
            type: 'string',
            pattern: '^(https://www.ah.nl/|https://mobileapi.jumbo.com/)',
        },
    },
    required: ['url'],
    additionalProperties: false,
});

module.exports = [
    authMiddleware('admin'),
    async (req, res) => {
        if (!validator(req.query)) return res.status(400).send({error: validator.errors});
        try {
            const url = req.query.url;
            let details;
            if (url.startsWith('https://www.ah.nl/')) {
                details = await getAhDetails({url});
            } else if (url.startsWith('https://mobileapi.jumbo.com/')) {
                details = await getJumboDetails({url});
            } else {
                return res.status(400).send('Unsupported url');
            }
            res.send({details});
        } catch (e) {
            console.error('❌  GET /scrape: ', e.message);
            res.status(500).send({error: 'Something went wrong'});
        }
    },
];
