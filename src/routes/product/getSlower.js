const Ajv = require('ajv');
const {raw} = require('objection');

const SearchIndex = require('../../models/searchIndex');
const escapeWhereLikeInput = require('../../utils/escapeWhereLikeInput');
const getNextLink = require('../../utils/getNextLink');

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

        const query = SearchIndex.query();
        if (req.query.name) {
            const words = req.query.name
                .split(' ')
                .map(word => word.replace(/([!&|:*])/g, ''))
                .filter(word => word !== '');
            const ranks = words.map(
                word => `
                GREATEST(
                    ts_rank(document, to_tsquery('simple', unaccent(?))),
                    ts_rank(reverse_document, to_tsquery('simple', reverse(unaccent(?))))
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
                .select(raw(`(${ranks.join(' + ')}) as rank`, bindings))
                .whereRaw(`(${wheres.join(' OR ')})`, bindings)
                .orderBy('rank', 'desc');
        }

        query.rightJoinRelation('product');

        // query.from('searchIndex').rightJoin('product', 'searchIndex.productId', 'product.id');

        if (req.query.classifications) {
            const classifications = req.query.classifications.split(',');
            query.whereIn('product.classification', classifications);
        }
        if (req.query.shopCode) {
            query.innerJoinRelation;
            query.innerJoin('productShop', 'product.id', 'productShop.productId');
            query.where('productShop.shopCode', req.query.shopCode);
        }
        if (req.query.categoryId) {
            query.innerJoin('productCategory', 'product.id', 'productCategory.productId');
            query.where('productCategory.categoryId', req.query.categoryId);
        }
        if (req.query.tagId) {
            query.innerJoin('productTag', 'product.id', 'productTag.productId');
            query
                .whereRaw(
                    `product_tag.tag_id in (
                    with recursive descendants as
                	( select tag_id as descendant from tag_tree
                	  where parent_id = :tagId or tag_id = :tagId
                	  union all
                	    select t.tag_id from descendants as d
                	    join tag_tree t on d.descendant = t.parent_id
                	)
                	select distinct descendant
                	from descendants
                	join tag on tag.id = descendant
                )`,
                    {tagId: req.query.tagId},
                )
                .debug();
        }
        query
            .range(offset, limit + offset - 1)
            .eager('[product, product.[brand, shops, categories, tags, barcodes]]')
            .orderBy('product.createdAt', 'desc')
            .orderBy('product.updatedAt', 'desc');
        const products = await query;

        const nextLink = getNextLink({
            limit,
            offset,
            total: products.total,
            path: '/v1/product',
            params: req.query,
        });
        res.send({items: products.results.map(result => result.product), nextLink});
    } catch (e) {
        console.error('❌  GET /product: ', e.message);
        res.status(500).send({error: 'Something went wrong'});
    }
};
