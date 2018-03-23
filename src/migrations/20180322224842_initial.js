const useTimestamps = false;
const defaultToNow = true;

exports.up = async (knex, Promise) => {
    await knex.schema.createTable('brand', table => {
        table.increments();
        table.string('name').notNullable();
        table.timestamps(useTimestamps, defaultToNow);
    });
    await knex.schema.createTable('shop', table => {
        table.string('code').primary();
        table.string('name').notNullable();
    });
    await knex('shop').insert([
        {code: 'ah', name: 'Albert Heijn'},
        {code: 'jumbo', name: 'Jumbo'},
        {code: 'lidl', name: 'Lidl'},
        {code: 'aldi', name: 'Aldi'},
    ]);
    await knex.schema.createTable('product', table => {
        table.increments();
        table.string('name').notNullable();
        table.string('filename').notNullable();
        table
            .integer('brand_id')
            .references('brand.id')
            .notNullable();
        table.timestamps(useTimestamps, defaultToNow);
    });
    await knex.schema.createTable('product_shop', table => {
        table
            .integer('productId')
            .references('product.id')
            .notNullable();
        table
            .string('shopCode')
            .references('shop.code')
            .notNullable();
        table.primary(['productId', 'shopCode']);
        table.timestamps(useTimestamps, defaultToNow);
    });
    await knex.schema.createTable('barcode', table => {
        table.string('code').primary();
        table
            .integer('productId')
            .references('product.id')
            .notNullable();
        table.timestamps(useTimestamps, defaultToNow);
    });
};

exports.down = async (knex, Promise) => {
    await knex.schema.dropTableIfExists('barcode');
    await knex.schema.dropTableIfExists('product_shop');
    await knex.schema.dropTableIfExists('product');
    await knex.schema.dropTableIfExists('shop');
    await knex.schema.dropTableIfExists('brand');
};
