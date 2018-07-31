const useTimestamps = false;
const defaultToNow = true;

exports.up = async knex => {
    await knex.raw(`
        CREATE EXTENSION pg_trgm;

        CREATE MATERIALIZED VIEW search_index
        AS
        SELECT product.id as product_id,
               to_tsvector('simple', unaccent(product.name)) ||
               to_tsvector('simple', unaccent(brand.name)) as document,
               to_tsvector('simple', reverse(unaccent(product.name))) ||
               to_tsvector('simple', reverse(unaccent(brand.name))) as reverse_document
        FROM product
        JOIN brand ON product.brand_id = brand.id
        GROUP BY product.id, brand.id;

        CREATE INDEX idx_fts_search ON search_index USING gin(document);
        CREATE INDEX idx_fts_search_reverse ON search_index USING gin(reverse_document);
    `);
};

exports.down = async knex => {
    await knex.raw('DROP MATERIALIZED VIEW search_index');
    await knex.raw('DROP EXTENSION pg_trgm');
};
