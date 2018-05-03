const Barcode = require('../../models/barcode');

module.exports = async (req, res) => {
    try {
        const barcode = await Barcode.query()
            .findOne({code: req.params.barcode})
            .eager('[product, product.brand, product.shops]');
        //.eager('[product, product.brand, product.shops]');
        if (barcode) {
            res.send(barcode.product);
        } else {
            res.status(400).send({error: 'No product found for this barcode'});
        }
    } catch (e) {
        console.error('❌  GET /product/barcode/{barcode}: ', e.message);
        res.status(500).send({error: 'Something went wrong'});
    }
};
