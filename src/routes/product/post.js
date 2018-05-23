const Joi = require('joi');
const multer = require('multer');
const {transaction} = require('objection');
const uuid = require('uuid/v4');
const _ = require('lodash');

const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (['image/jpeg', 'image/png'].includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(null, false);
        }
    },
    limits: {
        fileSize: 20971520,
        files: 1,
    },
});

const Product = require('../../models/product');
const imageToS3 = require('../../utils/imageToS3');

module.exports = [
    upload.single('image'),
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

                const data = await imageToS3.uploadWithThumbs({
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
