const useTimestamps = false;
const defaultToNow = true;

exports.up = async knex => {
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
        table.string('nameUnaccented').notNullable();
        table.string('filename').notNullable();
        table.enu('classification', ['YES', 'MAYBE', 'NO']).notNullable();
        table.string('explanation', 1000);
        table
            .integer('brandId')
            .references('brand.id')
            .notNullable();
        table.timestamps(useTimestamps, defaultToNow);
    });
    await knex.schema.createTable('productShop', table => {
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
    await knex.schema.createTable('category', table => {
        table.increments();
        table.string('name').notNullable();
    });
    await knex('category').insert([
        {id: 1, name: 'Broodbeleg'},
        {id: 2, name: 'Zoete tussendoortjes'},
        {id: 3, name: 'Hartige tussendoortjes'},
        {id: 4, name: 'Vleesvervangers'},
        {id: 5, name: 'Zuivelvervangers'},
    ]);
    await knex.raw('ALTER SEQUENCE category_id_seq RESTART WITH 6');
    await knex.schema.createTable('productCategory', table => {
        table
            .integer('productId')
            .references('product.id')
            .notNullable();
        table
            .integer('categoryId')
            .references('category.id')
            .notNullable();
        table.primary(['productId', 'categoryId']);
        table.timestamps(useTimestamps, defaultToNow);
    });
};

exports.down = async knex => {
    await knex.schema.dropTableIfExists('productCategory');
    await knex.schema.dropTableIfExists('category');
    await knex.schema.dropTableIfExists('barcode');
    await knex.schema.dropTableIfExists('productShop');
    await knex.schema.dropTableIfExists('product');
    await knex.schema.dropTableIfExists('shop');
    await knex.schema.dropTableIfExists('brand');
};
