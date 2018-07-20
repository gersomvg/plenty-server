const useTimestamps = false;
const defaultToNow = true;

exports.up = async knex => {
    await knex.schema.createTable('feedback', table => {
        table.increments();
        table.string('message', 1000).notNullable();
        table.string('barcode');
        table.integer('productId').references('product.id');
        table
            .boolean('archived')
            .defaultTo(false)
            .notNullable();
        table.timestamps(useTimestamps, defaultToNow);
    });
};

exports.down = async knex => {
    await knex.schema.dropTableIfExists('feedback');
};
