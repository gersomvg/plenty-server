const {Model} = require('objection');

class FeedbackModel extends Model {
    static get tableName() {
        return 'feedback';
    }

    static get relationMappings() {
        const Product = require('./product');
        return {
            product: {
                relation: Model.BelongsToOneRelation,
                modelClass: Product,
                join: {
                    from: 'feedback.productId',
                    to: 'product.id',
                },
            },
        };
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['message'],
            properties: {
                message: {type: 'string', pattern: '\\S+', maxLength: 1000},
                code: {type: 'string', pattern: '\\S+', maxLength: 255},
                productId: {type: 'integer'},
            },
        };
    }

    $beforeUpdate() {
        this.updatedAt = new Date().toISOString();
    }
}

module.exports = FeedbackModel;
