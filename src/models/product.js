const {Model, snakeCaseMappers} = require('objection');
const unaccent = require('../utils/unaccent');

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
            required: ['name', 'filename', 'brandId'],
            properties: {
                id: {type: 'integer'},
                name: {type: 'string', pattern: '\\S+', minLength: 1, maxLength: 255},
                filename: {
                    type: 'string',
                    pattern: '^[\\w,\\s-]+.[A-Za-z]{3,4}$',
                    minLength: 1,
                    maxLength: 255,
                },
                brandId: {type: 'integer'},
            },
        };
    }

    $formatDatabaseJson(obj) {
        obj = super.$formatDatabaseJson(obj);
        obj.name_unaccented = unaccent(obj.name);
        return obj;
    }

    $formatJson(obj) {
        obj = super.$formatJson(obj);
        if (obj.brand) delete obj.brandId;
        delete obj.filename;
        delete obj.nameUnaccented;
        return obj;
    }
}

module.exports = ProductModel;
