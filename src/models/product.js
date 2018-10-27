const {Model} = require('objection');

const getFileUrl = require('../utils/getFileUrl');

class ProductModel extends Model {
    static get tableName() {
        return 'product';
    }

    static get virtualAttributes() {
        return [
            'customThumbUrl',
            'customImageUrl',
            'officialThumbUrl',
            'officialImageUrl',
            'thumbUrl',
            'imageUrl',
        ];
    }

    get customThumbUrl() {
        return getFileUrl({filename: this.customImage, type: 'product', size: 'small'});
    }
    get customImageUrl() {
        return getFileUrl({filename: this.customImage, type: 'product', size: 'large'});
    }
    get officialThumbUrl() {
        return getFileUrl({filename: this.officialImage, type: 'product', size: 'small'});
    }
    get officialImageUrl() {
        return getFileUrl({filename: this.officialImage, type: 'product', size: 'large'});
    }
    get thumbUrl() {
        return this.officialImage ? this.officialThumbUrl : this.customThumbUrl;
    }
    get imageUrl() {
        return this.officialImage ? this.officialImageUrl : this.customImageUrl;
    }

    static get relationMappings() {
        const Brand = require('./brand');
        const Barcode = require('./barcode');
        const Shop = require('./shop');
        const Category = require('./category');
        const Tag = require('./tag');
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
            tags: {
                relation: Model.ManyToManyRelation,
                modelClass: Tag,
                join: {
                    from: 'product.id',
                    to: 'tag.id',
                    through: {
                        from: 'productTag.productId',
                        to: 'productTag.tagId',
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

    $formatJson(obj) {
        obj = super.$formatJson(obj);
        if (obj.brand) delete obj.brandId;
        if (obj.barcodes) {
            obj.barcodes = obj.barcodes.map(bcObj => bcObj.code);
        }
        delete obj.customImage;
        delete obj.officialImage;
        return obj;
    }

    $beforeUpdate() {
        this.updatedAt = new Date().toISOString();
    }
}

module.exports = ProductModel;
