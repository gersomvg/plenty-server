const Ajv = require('ajv');
const {transaction} = require('objection');
const fetch = require('node-fetch');

const uploadMiddleware = require('../../utils/uploadMiddleware');
const authMiddleware = require('../../utils/authMiddleware');

const Product = require('../../models/product');
const S3Image = require('../../utils/S3Image');
const {getFileName, getExtension, getFullName} = require('./utils/fileName');

const validator = new Ajv({allErrors: true}).compile({
    type: 'object',
    properties: {
        name: {type: 'string', pattern: '\\S+', minLength: 1, maxLength: 255},
        classification: {type: 'string', enum: ['YES', 'MAYBE', 'NO']},
        externalImage: {type: 'string', format: 'uri'},
    },
    required: ['name', 'classification'],
});

module.exports = [
    uploadMiddleware.fields([
        {name: 'image', maxCount: 1}, // For backwards compatibility
        {name: 'customImage', maxCount: 1},
        {name: 'officialImage', maxCount: 1},
    ]),
    authMiddleware('admin'),
    async (req, res) => {
        try {
            if (!validator(req.body)) return res.status(400).send({error: validator.errors});

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

            let {image, customImage, officialImage} = req.files;
            image = image && image.length ? image[0] : null;
            customImage = customImage && customImage.length ? customImage[0] : null;
            officialImage = officialImage && officialImage.length ? officialImage[0] : null;
            let customFilename, customExtension, officialFilename, officialExtension;
            if (image) {
                customImage = image; // For backwards compatibility
            }
            if (customImage) {
                customFilename = getFileName(req.body.name);
                customExtension = getExtension(customImage);
            }
            if (officialImage || req.body.externalImage) {
                officialFilename = getFileName(req.body.name);
                officialExtension = getExtension(officialImage || req.body.externalImage);
            }

            const newProduct = await transaction(Product.knex(), async trx => {
                const currentProduct = await Product.query(trx).findById(req.params.id);
                if (!currentProduct) {
                    return res.status('404').send({error: 'No product found for this id'});
                }

                const updatedProduct = await Product.query(trx)
                    .upsertGraph(
                        {
                            id: Number(req.params.id),
                            name: req.body.name,
                            explanation: req.body.explanation,
                            classification: req.body.classification,
                            brandId: Number(req.body.brandId),
                            customImage:
                                getFullName(customFilename, customExtension) ||
                                currentProduct.customImage,
                            officialImage:
                                getFullName(officialFilename, officialExtension) ||
                                currentProduct.officialImage,
                            shops,
                            categories,
                            tags,
                            barcodes,
                        },
                        {
                            update: true, // Do an update instead of a patch
                            relate: ['shops', 'categories', 'tags'],
                            unrelate: ['shops', 'categories', 'tags'],
                            insertMissing: ['barcodes'],
                        },
                    )
                    .eager('[brand, shops, categories, tags, barcodes]');

                /**
                 * Upload the custom image, if supplied
                 */
                if (customImage) {
                    await S3Image.uploadWithThumbs({
                        path: `products`,
                        filename: customFilename,
                        extension: customExtension,
                        body: customImage.buffer,
                    });
                }

                /**
                 * Fetch and upload the image from an external source, if supplied.
                 * Otherwise upload the official image, if supplied.
                 */
                if (officialImage || req.body.externalImage) {
                    let fileBody;
                    if (req.body.externalImage) {
                        const externalImage = await fetch(req.body.externalImage);
                        fileBody = await externalImage.buffer();
                    } else {
                        fileBody = officialImage.buffer;
                    }
                    await S3Image.uploadWithThumbs({
                        path: `products`,
                        filename: officialFilename,
                        extension: officialExtension,
                        body: fileBody,
                    });
                }

                return updatedProduct;
            });

            await Product.knex().raw('REFRESH MATERIALIZED VIEW search_index');

            res.send(newProduct);
        } catch (e) {
            console.error('❌  PUT /product: ', e.message);
            res.status(500).send({error: 'Something went wrong'});
        }
    },
];
