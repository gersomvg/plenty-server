const {Model, snakeCaseMappers} = require('objection');

class BrandModel extends Model {
    static get tableName() {
        return 'brand';
    }

    static get columnNameMappers() {
        return snakeCaseMappers();
    }

    static get relationMappings() {
        const Product = require('./product');
        return {
            products: {
                relation: Model.HasManyRelation,
                modelClass: Product,
                join: {
                    from: 'brand.id',
                    to: 'product.brand_id',
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
                name: {type: 'string', pattern: '\\S+', minLength: 1, maxLength: 255},
            },
        };
    }
}

module.exports = BrandModel;
