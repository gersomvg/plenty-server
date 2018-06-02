const useTimestamps = false;
const defaultToNow = true;

exports.up = async knex => {
    await knex.schema.createTable('user', table => {
        table.increments();
        table
            .string('email')
            .notNullable()
            .unique();
        table.string('password').notNullable();
        table.string('firstName').notNullable();
        table.string('lastName').notNullable();
        table
            .boolean('superAdmin')
            .defaultTo(false)
            .notNullable();
        table.timestamps(useTimestamps, defaultToNow);
    });
};

exports.down = async knex => {
    await knex.schema.dropTableIfExists('user');
};
