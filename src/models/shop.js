const {Model} = require('objection');

const getFileUrl = require('../utils/getFileUrl');

class ShopModel extends Model {
    static get tableName() {
        return 'shop';
    }

    static get idColumn() {
        return 'code';
    }

    static get virtualAttributes() {
        return ['imageUrl'];
    }

    get imageUrl() {
        return getFileUrl({type: 'shop', filename: `${this.code}.png`});
    }

    static get relationMappings() {
        const Product = require('./product');
        return {
            products: {
                relation: Model.ManyToManyRelation,
                modelClass: Product,
                join: {
                    from: 'shop.code',
                    to: 'product.id',
                    through: {
                        from: 'productShop.shopCode',
                        to: 'productShop.productId',
                    },
                },
            },
        };
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['code', 'name'],
            properties: {
                code: {type: 'string', pattern: '[a-z]+', maxLength: 32},
                name: {type: 'string', pattern: '\\S+', maxLength: 255},
            },
        };
    }
}

module.exports = ShopModel;
