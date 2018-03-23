const {Model, snakeCaseMappers} = require('objection');

class ProductModel extends Model {
    static get tableName() {
        return 'product';
    }

    static get columnNameMappers() {
        return snakeCaseMappers();
    }

    static get virtualAttributes() {
        return ['fileUrl'];
    }

    get fileUrl() {
        return `${process.env.STORAGE_URL}${process.env.STORAGE_PRODUCTS_FOLDER}/${this.filename}`;
    }

    static get relationMappings() {
        const Brand = require('./brand');
        return {
            brand: {
                relation: Model.BelongsToOneRelation,
                modelClass: Brand,
                join: {
                    from: 'product.brand_id',
                    to: 'brand.id',
                },
            },
        };
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['name', 'filename', 'brand_id'],
            properties: {
                id: {type: 'integer'},
                name: {type: 'string', pattern: '\\S+', minLength: 1, maxLength: 255},
                filename: {
                    type: 'string',
                    pattern: '^[w,s-]+.[A-Za-z]{3,4}$',
                    minLength: 1,
                    maxLength: 255,
                },
                brand_id: {type: 'integer'},
            },
        };
    }

    $formatJson(obj) {
        obj = super.$formatJson(obj);
        if (obj.brand) delete obj.brandId;
        delete obj.filename;
        return obj;
    }
}

module.exports = ProductModel;
