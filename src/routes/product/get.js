const Product = require('../../models/product');

module.exports = async (req, res) => {
    try {
        const products = await Product.query().eager('brand');
        res.send({items: products});
    } catch (e) {
        console.error('❌  GET /product: ', e.message);
        res.status(500).send({error: 'Something went wrong'});
    }
};
