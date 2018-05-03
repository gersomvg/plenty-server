const {Model} = require('objection');
const unaccent = require('../utils/unaccent');

class ProductModel extends Model {
    static get tableName() {
        return 'product';
    }

    static get virtualAttributes() {
        return ['imageUrl', 'thumbUrl'];
    }

    get imageUrl() {
        return `${process.env.STORAGE_URL}${process.env.STORAGE_PRODUCTS_FOLDER}/${this.filename}`;
    }

    get thumbUrl() {
        const thumbFileName = [
            this.filename.slice(0, this.filename.length - 4),
            '.small',
            this.filename.slice(-4),
        ].join('');
        return `${process.env.STORAGE_URL}${process.env.STORAGE_PRODUCTS_FOLDER}/${thumbFileName}`;
    }

    static get relationMappings() {
        const Brand = require('./brand');
        const Barcode = require('./barcode');
        const Shop = require('./shop');
        return {
            brand: {
                relation: Model.BelongsToOneRelation,
                modelClass: Brand,
                join: {
                    from: 'product.brandId',
                    to: 'brand.id',
                },
            },
            barcode: {
                relation: Model.HasOneRelation,
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
        };
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['name', 'filename', 'brandId'],
            properties: {
                id: {type: 'integer'},
                name: {type: 'string', pattern: '\\S+', minLength: 1, maxLength: 255},
                filename: {
                    type: 'string',
                    pattern: '^[\\w,\\s-]+.[A-Za-z]{3,4}$',
                    minLength: 1,
                    maxLength: 255,
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
}

module.exports = ProductModel;
