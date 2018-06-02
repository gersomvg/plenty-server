const Joi = require('joi');
const {transaction} = require('objection');
const uuid = require('uuid/v4');
const _ = require('lodash');

const uploadMiddleware = require('../../utils/uploadMiddleware');
const authMiddleware = require('../../utils/authMiddleware');

const Product = require('../../models/product');
const S3Image = require('../../utils/S3Image');

module.exports = [
    authMiddleware('admin'),
    uploadMiddleware.single('image'),
    async (req, res) => {
        try {
            if (!req.file) throw new Error('No valid file was provided');

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
                    barcodes = req.body.barcodes.map(code => ({code}));
                }

                let filename = '',
                    extension = '';
                if (typeof req.body.name === 'string') {
                    filename = `${_.kebabCase(req.body.name.substring(0, 64))}-${uuid()}`;
                    extension = req.file.mimetype.split('/').pop();
                }

                const insertedProduct = await Product.query(trx)
                    .upsertGraph(
                        {
                            name: req.body.name,
                            explanation: req.body.explanation,
                            classification: req.body.classification,
                            brandId: Number(req.body.brandId),
                            filename: `${filename}.${extension}`,
                            shops,
                            categories,
                            barcodes,
                        },
                        {relate: ['shops', 'categories'], insertMissing: ['barcodes']},
                    )
                    .eager('[brand, shops, categories, barcodes]');

                const data = await S3Image.uploadWithThumbs({
                    path: `products`,
                    filename,
                    extension,
                    body: req.file.buffer,
                });

                return insertedProduct;
            });

            res.send(newProduct);
        } catch (e) {
            console.error('❌  POST /product: ', e.message);
            res.status(500).send({error: 'Something went wrong'});
        }
    },
];
