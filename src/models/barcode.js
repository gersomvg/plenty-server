const {Model} = require('objection');

class BarcodeModel extends Model {
    static get tableName() {
        return 'barcode';
    }

    static get relationMappings() {
        const Product = require('./product');
        return {
            product: {
                relation: Model.BelongsToOneRelation,
                modelClass: Product,
                join: {
                    from: 'barcode.productId',
                    to: 'product.id',
                },
            },
        };
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['name'],
            properties: {
                code: {type: 'string', pattern: '\\S+', minLength: 1, maxLength: 255},
                productId: {type: 'integer'},
            },
        };
    }
}

module.exports = BarcodeModel;
