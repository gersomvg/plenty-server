const {Model} = require('objection');
const unaccent = require('../utils/unaccent');

const getFileUrl = (filename, size) => {
    const parts = filename.split('.');
    const extension = parts.pop();
    const newFilename = `${parts.join('')}.${size}.${extension}`;
    return `https://${process.env.AWS_BUCKET}.${process.env.AWS_ENDPOINT}/products/${newFilename}`;
};

class ProductModel extends Model {
    static get tableName() {
        return 'product';
    }

    static get virtualAttributes() {
        return ['imageUrl', 'thumbUrl'];
    }

    get imageUrl() {
        return getFileUrl(this.filename, 'large');
    }

    get thumbUrl() {
        return getFileUrl(this.filename, 'small');
    }

    static get relationMappings() {
        const Brand = require('./brand');
        const Barcode = require('./barcode');
        const Shop = require('./shop');
        const Category = require('./category');
        return {
            brand: {
                relation: Model.BelongsToOneRelation,
                modelClass: Brand,
                join: {
                    from: 'product.brandId',
                    to: 'brand.id',
                },
            },
            barcodes: {
                relation: Model.HasManyRelation,
                modelClass: Barcode,
                join: {
                    from: 'product.id',
                    to: 'barcode.productId',
                },
            },
            shops: {
                relation: Model.ManyToManyRelation,
                modelClass: Shop,
                join: {
                    from: 'product.id',
                    to: 'shop.code',
                    through: {
                        from: 'productShop.productId',
                        to: 'productShop.shopCode',
                    },
                },
            },
            categories: {
                relation: Model.ManyToManyRelation,
                modelClass: Category,
                join: {
                    from: 'product.id',
                    to: 'category.id',
                    through: {
                        from: 'productCategory.productId',
                        to: 'productCategory.categoryId',
                    },
                },
            },
        };
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['name', 'filename', 'classification', 'brandId'],
            properties: {
                id: {type: 'integer'},
                name: {type: 'string', pattern: '\\S+', maxLength: 255},
                explanation: {type: 'string', maxLength: 1000},
                filename: {
                    type: 'string',
                    pattern: '^[\\w,\\s-]+.[A-Za-z]{3,4}$',
                    maxLength: 255,
                },
                classification: {
                    enum: ['YES', 'MAYBE', 'NO'],
                },
                brandId: {type: 'integer'},
            },
        };
    }

    $formatDatabaseJson(obj) {
        obj = super.$formatDatabaseJson(obj);
        obj.name_unaccented = unaccent(obj.name);
        return obj;
    }

    $formatJson(obj) {
        obj = super.$formatJson(obj);
        if (obj.brand) delete obj.brandId;
        delete obj.filename;
        delete obj.nameUnaccented;
        return obj;
    }

    $beforeUpdate() {
        this.updatedAt = new Date().toISOString();
    }
}

module.exports = ProductModel;
