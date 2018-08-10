const useTimestamps = false;
const defaultToNow = true;

exports.up = async knex => {
    await knex.schema.createTable('tag', table => {
        table.increments();
        table.string('name').notNullable();
    });

    await knex.schema.createTable('tagTree', table => {
        table.increments();
        table
            .integer('tagId')
            .references('tag.id')
            .notNullable();
        table.integer('parentId').references('tag.id');
        table.integer('sequence').notNullable();
    });

    await knex.schema.createTable('productTag', table => {
        table
            .integer('productId')
            .references('product.id')
            .notNullable();
        table
            .integer('tagId')
            .references('tag.id')
            .notNullable();
        table.primary(['productId', 'tagId']);
    });
};

exports.down = async knex => {
    await knex.schema.dropTableIfExists('productTag');
    await knex.schema.dropTableIfExists('tagTree');
    await knex.schema.dropTableIfExists('tag');
};
