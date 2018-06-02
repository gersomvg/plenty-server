const {Model} = require('objection');

class BrandModel extends Model {
    static get tableName() {
        return 'brand';
    }

    static get relationMappings() {
        const Product = require('./product');
        return {
            products: {
                relation: Model.HasManyRelation,
                modelClass: Product,
                join: {
                    from: 'brand.id',
                    to: 'product.brandId',
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

    $beforeUpdate() {
        this.updatedAt = new Date().toISOString();
    }
}

module.exports = BrandModel;
