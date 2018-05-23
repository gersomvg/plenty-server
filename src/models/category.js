const {Model} = require('objection');

class CategoryModel extends Model {
    static get tableName() {
        return 'category';
    }

    static get relationMappings() {
        const Product = require('./product');
        return {
            products: {
                relation: Model.ManyToManyRelation,
                modelClass: Product,
                join: {
                    from: 'category.id',
                    to: 'product.id',
                    through: {
                        from: 'productCategory.categoryId',
                        to: 'productCategory.productId',
                    },
                },
            },
        };
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['name'],
            properties: {
                id: {type: 'integer'},
                name: {type: 'string', pattern: '\\S+', maxLength: 255},
            },
        };
    }
}

module.exports = CategoryModel;
