/**
 * This endpoint is implemented differently than the other endpoints. It was really hard to use
 * objection to achieve the complex combination of search, joins and pagination needed here.
 * Therefore I fell back to writing raw queries (using knex) and afterwards mapping the results
 * to objection models.
 */

const Ajv = require('ajv');
const Knex = require('knex');

const Product = require('../../models/product');
const Brand = require('../../models/brand');
const Shop = require('../../models/shop');
const Category = require('../../models/category');
const Tag = require('../../models/tag');
const Barcode = require('../../models/barcode');
const escapeWhereLikeInput = require('../../utils/escapeWhereLikeInput');
const getNextLink = require('../../utils/getNextLink');
const getFileUrl = require('../../utils/getFileUrl');
const knexConfig = require('../../../knexfile');

const knex = Product.knex();

const validator = new Ajv({allErrors: true}).compile({
    type: 'object',
    properties: {
        name: {type: 'string', maxLength: 255},
        categoryId: {type: 'string', pattern: '^\\d*$'},
        tagId: {type: 'string', pattern: '^\\d*$'},
        shopCode: {type: 'string', pattern: '^[a-z]*$'},
        withoutTag: {type: 'string', pattern: '^(true|false)?$'},
        withoutBarcode: {type: 'string', pattern: '^(true|false)?$'},
        archived: {type: 'string', pattern: '^(true|false)$'},
        limit: {type: 'string', pattern: '^\\d{1,2}$'},
        offset: {type: 'string', pattern: '^\\d+$'},
        classifications: {type: 'string', pattern: '^((YES|MAYBE|NO)(,(YES|MAYBE|NO))*)?$'},
    },
    additionalProperties: false,
});

module.exports = async (req, res) => {
    try {
        if (!validator(req.query)) return res.status(400).send({error: validator.errors});

        const limit = Number(req.query.limit || 25);
        const offset = Number(req.query.offset || 0);

        const query = knex('searchIndex')
            .select(
                'product.*',
                knex.raw('count(*) OVER() AS full_count'),
                knex.raw('jsonb_agg(distinct brand) as brand'),
                knex.raw(
                    "case when count(shop) = 0 then '[]' else jsonb_agg(distinct shop) end as shops",
                ),
                knex.raw(
                    "case when count(category) = 0 then '[]' else jsonb_agg(distinct category) end as categories",
                ),
                knex.raw(
                    "case when count(tag) = 0 then '[]' else jsonb_agg(distinct tag) end as tags",
                ),
                knex.raw(
                    "case when count(barcode) = 0 then '[]' else jsonb_agg(distinct barcode) end as barcodes",
                ),
            )
            .rightJoin('product', 'searchIndex.productId', 'product.id')
            .innerJoin('brand', 'product.brandId', 'brand.id')
            .leftJoin('productShop', 'product.id', 'productShop.productId')
            .leftJoin('shop', 'productShop.shopCode', 'shop.code')
            .leftJoin('productCategory', 'product.id', 'productCategory.productId')
            .leftJoin('category', 'productCategory.categoryId', 'category.id')
            .leftJoin('productTag', 'product.id', 'productTag.productId')
            .leftJoin('tag', 'productTag.tagId', 'tag.id')
            .leftJoin('barcode', 'product.id', 'barcode.productId')
            .groupBy(
                'searchIndex.productId',
                'searchIndex.document',
                'searchIndex.reverseDocument',
                'product.id',
            )
            .limit(limit)
            .offset(offset);

        if (req.query.name) {
            const words = req.query.name
                .split(' ')
                .map(word => word.replace(/([!&|:*])/g, ''))
                .filter(word => word !== '');
            const ranks = words.map(
                word => `
                    GREATEST(
                        ts_rank(document, to_tsquery('simple', unaccent(?))),
                        ts_rank(reverse_document, to_tsquery('simple', reverse(unaccent(?)))) / 2
                    )
                `,
            );
            const wheres = words.map(
                word =>
                    "document @@ to_tsquery('simple', unaccent(?)) OR reverse_document @@ to_tsquery('simple', reverse(unaccent(?)))",
            );
            const bindings = [];
            words.forEach(word => {
                bindings.push(`${word}:*`);
                bindings.push(`*:${word}`);
            });
            query
                .select(knex.raw(`(${ranks.join(' + ')}) as rank`, bindings))
                .whereRaw(`(${wheres.join(') AND (')})`, bindings)
                .orderBy('rank', 'desc');
        }
        if (req.query.classifications) {
            const classifications = req.query.classifications.split(',');
            query.whereIn('product.classification', classifications);
        }
        if (req.query.shopCode) {
            query.whereExists(
                knex('productShop')
                    .whereRaw('product_id = product.id')
                    .where('shopCode', req.query.shopCode),
            );
        }
        if (req.query.categoryId) {
            query.whereExists(
                knex('productCategory')
                    .whereRaw('product_id = product.id')
                    .where('categoryId', req.query.categoryId),
            );
        }
        if (req.query.tagId) {
            query.whereExists(
                knex('productTag')
                    .whereRaw('product_id = product.id')
                    .whereIn(
                        'tagId',
                        knex.raw(
                            `
                                with recursive descendants as
                            	( select tag_id as descendant from tag_tree
                            	  where parent_id = :tagId or tag_id = :tagId
                            	  union all
                            	    select t.tag_id from descendants as d
                            	    join tag_tree t on d.descendant = t.parent_id
                            	)
                            	select distinct descendant
                            	from descendants
                            `,
                            {tagId: req.query.tagId},
                        ),
                    ),
            );
        }
        if (req.query.withoutTag === 'true') {
            query.whereNotExists(knex('productTag').whereRaw('product_id = product.id'));
        }
        if (req.query.withoutBarcode === 'true') {
            query.whereNotExists(knex('barcode').whereRaw('product_id = product.id'));
        }
        query.where({archived: req.query.archived === 'true'});

        query.orderBy('product.createdAt', 'desc').orderBy('product.updatedAt', 'desc');

        const products = await query;

        const nextLink = getNextLink({
            limit,
            offset,
            total: products.length && products[0].fullCount,
            path: '/v1/product',
            params: req.query,
        });

        const mappedProducts = products.map(product => {
            const {fullCount, rank, brand, shops, categories, tags, barcodes, ...attrs} = product;
            return Product.fromDatabaseJson(attrs).$set({
                brand: Brand.fromDatabaseJson(brand[0]),
                shops: shops.map(shop => Shop.fromDatabaseJson(shop)),
                categories: categories.map(category => Category.fromDatabaseJson(category)),
                tags: tags.map(tag => Tag.fromDatabaseJson(tag)),
                barcodes: barcodes.map(barcode => Barcode.fromDatabaseJson(barcode)),
            });
        });

        res.send({items: mappedProducts, nextLink});
    } catch (e) {
        console.error('❌  GET /product: ', e.message);
        res.status(500).send({error: 'Something went wrong'});
    }
};
