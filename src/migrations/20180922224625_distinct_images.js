exports.up = async knex => {
    await knex.schema.alterTable('product', table => {
        table
            .string('filename')
            .nullable()
            .alter();
        table.renameColumn('filename', 'customImage');
        table.string('officialImage').nullable();
    });
};

exports.down = async knex => {
    await knex.schema.alterTable('product', table => {
        table.dropColumn('officialImage');
        table.renameColumn('customImage', 'filename');
    });
};
