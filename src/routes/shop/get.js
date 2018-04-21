const Shop = require('../../models/shop');

module.exports = async (req, res) => {
    try {
        const shops = await Shop.query();

        res.send({items: shops});
    } catch (e) {
        console.error('❌  GET /shop: ', e.message);
        res.status(500).send({error: 'Something went wrong'});
    }
};
