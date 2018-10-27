const {Model} = require('objection');

class SearchIndex extends Model {
    static get tableName() {
        return 'searchIndex';
    }

    static get idColumn() {
        return 'productId';
    }

    static get relationMappings() {
        const Product = require('./product');
        return {
            product: {
                relation: Model.BelongsToOneRelation,
                modelClass: Product,
                join: {
                    from: 'searchIndex.productId',
                    to: 'product.id',
                },
            },
        };
    }
}

module.exports = SearchIndex;
