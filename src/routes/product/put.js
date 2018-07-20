const {transaction} = require('objection');
const uuid = require('uuid/v4');
const _ = require('lodash');

const uploadMiddleware = require('../../utils/uploadMiddleware');
const authMiddleware = require('../../utils/authMiddleware');

const Product = require('../../models/product');
const S3Image = require('../../utils/S3Image');

module.exports = [
    uploadMiddleware.single('image'),
    authMiddleware('admin'),
    async (req, res) => {
        try {
            const newProduct = await transaction(Product.knex(), async trx => {
                let shops = [];
                if (Array.isArray(req.body.shopCodes)) {
                    shops = req.body.shopCodes.map(code => ({code}));
                }
                let categories = [];
                if (Array.isArray(req.body.categoryIds)) {
                    categories = req.body.categoryIds.map(id => ({id}));
                }
                let barcodes = [];
                if (Array.isArray(req.body.barcodes)) {
                    barcodes = req.body.barcodes.map(code => ({code: code.trim()}));
                }

                const currentProduct = await Product.query(trx).findById(req.params.id);

                if (!currentProduct) {
                    return res.status('404').send({error: 'No product found for this id'});
                }

                let oldFilename = currentProduct.filename.split('.');
                let oldExtension = oldFilename.pop();
                oldFilename = oldFilename.join('');

                let filename = oldFilename;
                let extension = oldExtension;
                if (req.file && typeof req.body.name === 'string') {
                    filename = `${_.kebabCase(req.body.name.substring(0, 64))}-${uuid()}`;
                    extension = req.file.mimetype.split('/').pop();
                }

                const updatedProduct = await Product.query(trx)
                    .upsertGraph(
                        {
                            id: Number(req.params.id),
                            name: req.body.name,
                            explanation: req.body.explanation,
                            classification: req.body.classification,
                            brandId: Number(req.body.brandId),
                            filename: `${filename}.${extension}`,
                            shops,
                            categories,
                            barcodes,
                        },
                        {
                            update: true, // Do an update instead of a patch
                            relate: ['shops', 'categories'],
                            unrelate: ['shops', 'categories'],
                            insertMissing: ['barcodes'],
                        },
                    )
                    .eager('[brand, shops, categories, barcodes]');

                if (req.file) {
                    // Upload new images
                    const data = await S3Image.uploadWithThumbs({
                        path: `products`,
                        filename,
                        extension,
                        body: req.file.buffer,
                    });
                    // Remove old images
                    await S3Image.removeAllSizes({
                        path: `products`,
                        filename: oldFilename,
                        extension: oldExtension,
                    });
                }

                return updatedProduct;
            });

            res.send(newProduct);
        } catch (e) {
            console.error('❌  PUT /product: ', e.message);
            res.status(500).send({error: 'Something went wrong'});
        }
    },
];
