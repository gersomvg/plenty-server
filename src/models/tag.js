const {Model} = require('objection');

class TagModel extends Model {
    static get tableName() {
        return 'tag';
    }

    static get relationMappings() {
        const Product = require('./product');
        return {
            children: {
                relation: Model.ManyToManyRelation,
                modelClass: TagModel,
                join: {
                    from: 'tag.id',
                    to: 'tag.id',
                    through: {
                        from: 'tagTree.parentId',
                        to: 'tagTree.tagId',
                    },
                },
            },
            products: {
                relation: Model.ManyToManyRelation,
                modelClass: Product,
                join: {
                    from: 'tag.id',
                    to: 'product.id',
                    through: {
                        from: 'productTag.tagId',
                        to: 'productTag.productId',
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

module.exports = TagModel;
