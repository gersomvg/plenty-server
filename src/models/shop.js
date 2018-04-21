const {Model} = require('objection');

class ShopModel extends Model {
    static get tableName() {
        return 'shop';
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
                code: {type: 'string', pattern: '\\S+', minLength: 1, maxLength: 32},
                name: {type: 'string', pattern: '\\S+', minLength: 1, maxLength: 255},
            },
        };
    }
}

module.exports = ShopModel;
