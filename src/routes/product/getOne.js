const Product = require('../../models/product');

module.exports = async (req, res) => {
    try {
        const product = await Product.query()
            .findById(req.params.id)
            .eager('[brand, shops]');
        if (product) {
            res.send(product);
        } else {
            res.status(404).send({error: 'No product found for this ID'});
        }
    } catch (e) {
        console.error('❌  GET /product/{id}: ', e.message);
        res.status(500).send({error: 'Something went wrong'});
    }
};
