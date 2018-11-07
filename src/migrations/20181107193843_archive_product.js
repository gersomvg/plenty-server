exports.up = async knex => {
    await knex.schema.alterTable('product', table => {
        table
            .boolean('archived')
            .defaultTo(false)
            .notNullable();
    });
};

exports.down = async knex => {
    await knex.schema.alterTable('product', table => {
        table.dropColumn('archived');
    });
};
