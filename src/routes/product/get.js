const Ajv = require('ajv');
const Knex = require('knex');

const SearchIndex = require('../../models/searchIndex');
const escapeWhereLikeInput = require('../../utils/escapeWhereLikeInput');
const getNextLink = require('../../utils/getNextLink');
const getFileUrl = require('../../utils/getFileUrl');
const knexConfig = require('../../../knexfile');

const knex = Knex(knexConfig[process.env.NODE_ENV]);

const validator = new Ajv({allErrors: true}).compile({
    type: 'object',
    properties: {
        name: {type: 'string', maxLength: 255},
        categoryId: {type: 'string', pattern: '^\\d*$'},
        tagId: {type: 'string', pattern: '^\\d*$'},
        shopCode: {type: 'string', pattern: '^[a-z]*$'},
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
                    "case when count(barcode) = 0 then '[]' else jsonb_agg(distinct barcode.code) end as barcodes",
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
                    .debug()
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

        query.orderBy('product.createdAt', 'desc').orderBy('product.updatedAt', 'desc');

        const products = await query;

        const nextLink = getNextLink({
            limit,
            offset,
            total: products.length && products[0].fullCount,
            path: '/v1/product',
            params: req.query,
        });

        products.forEach(product => {
            delete product.brandId;
            delete product.rank;
            delete product.fullCount;
            product.brand = product.brand[0];
            product.imageUrl = getFileUrl({
                filename: product.filename,
                size: 'large',
                type: 'product',
            });
            product.thumbUrl = getFileUrl({
                filename: product.filename,
                size: 'small',
                type: 'product',
            });
            product.shops.forEach(shop => {
                shop.imageUrl = getFileUrl({filename: `${shop.code}.png`, type: 'shop'});
            });
        });

        res.send({items: products, nextLink});
    } catch (e) {
        console.error('❌  GET /product: ', e.message);
        res.status(500).send({error: 'Something went wrong'});
    }
};
