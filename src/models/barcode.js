const {Model} = require('objection');

class BarcodeModel extends Model {
    static get tableName() {
        return 'barcode';
    }

    static get idColumn() {
        return 'code';
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
            required: ['code', 'productId'],
            properties: {
                code: {type: 'string', pattern: '\\S+', maxLength: 255},
                productId: {type: 'integer'},
            },
        };
    }

    $beforeUpdate() {
        this.updatedAt = new Date().toISOString();
    }
}

module.exports = BarcodeModel;
