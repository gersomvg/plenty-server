const {transaction} = require('objection');
const uuid = require('uuid/v4');
const _ = require('lodash');
const fetch = require('node-fetch');

const uploadMiddleware = require('../../utils/uploadMiddleware');
const authMiddleware = require('../../utils/authMiddleware');

const Product = require('../../models/product');
const S3Image = require('../../utils/S3Image');

module.exports = [
    uploadMiddleware.single('image'),
    authMiddleware('admin'),
    async (req, res) => {
        try {
            if (!req.file && !req.body.shopImageUrl) throw new Error('No valid image was provided');

            if (
                req.body.shopImageUrl &&
                !(
                    req.body.shopImageUrl.startsWith('https://static.ah.nl/') ||
                    req.body.shopImageUrl.startsWith('https://static-images.jumbo.com/')
                )
            ) {
                return res.status(400).send('Unsupported shop image url');
            }

            const newProduct = await transaction(Product.knex(), async trx => {
                let shops = [];
                if (Array.isArray(req.body.shopCodes)) {
                    shops = req.body.shopCodes.map(code => ({code}));
                }
                let categories = [];
                if (Array.isArray(req.body.categoryIds)) {
                    categories = req.body.categoryIds.map(id => ({id}));
                }
                let tags = [];
                if (Array.isArray(req.body.tagIds)) {
                    tags = req.body.tagIds.map(id => ({id}));
                }
                let barcodes = [];
                if (Array.isArray(req.body.barcodes)) {
                    barcodes = req.body.barcodes.map(code => ({code: code.trim()}));
                }

                let filename = '',
                    extension = '';
                if (typeof req.body.name === 'string') {
                    filename = `${_.kebabCase(req.body.name.substring(0, 64))}-${uuid()}`;
                    extension = req.file
                        ? req.file.mimetype.split('/').pop()
                        : req.body.shopImageUrl.split('.').pop();
                }

                console.log(filename, '()()', extension);

                const insertedProduct = await Product.query(trx)
                    .upsertGraph(
                        {
                            name: req.body.name.trim(),
                            explanation: req.body.explanation.trim(),
                            classification: req.body.classification,
                            brandId: Number(req.body.brandId),
                            filename: `${filename}.${extension}`,
                            shops,
                            categories,
                            tags,
                            barcodes,
                        },
                        {relate: ['shops', 'categories', 'tags'], insertMissing: ['barcodes']},
                    )
                    .eager('[brand, shops, categories, tags, barcodes]');

                let fileBody;

                if (req.file) {
                    fileBody = req.file.buffer;
                } else {
                    const externalImage = await fetch(req.body.shopImageUrl);
                    fileBody = await externalImage.buffer();
                }

                await S3Image.uploadWithThumbs({
                    path: `products`,
                    filename,
                    extension,
                    body: fileBody,
                });

                return insertedProduct;
            });

            await Product.knex().raw('REFRESH MATERIALIZED VIEW search_index');

            res.send(newProduct);
        } catch (e) {
            console.error('❌  POST /product: ', e.message);
            res.status(500).send({error: 'Something went wrong'});
        }
    },
];
