if (!process.env.DATABASE_URL) require('dotenv').config();
const {knexSnakeCaseMappers} = require('objection');

const common = {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    ssl: true,
    migrations: {
        tableName: 'knex_migrations',
        directory: `${__dirname}/src/migrations`,
    },
    seeds: {
        directory: `${__dirname}/src/seeds`,
    },

    // These mappers make sure all parts of the application work with camelCasing, making snake_case
    // only visible in the actual database schema and when writing raw queries
    ...knexSnakeCaseMappers(),
};

module.exports = {
    development: {
        ...common,
    },
    staging: {
        ...common,
    },
    production: {
        ...common,
        // Making sure that it is impossible to run seeds on production, because they start with a
        // dectructive deletion of all table rows
        seeds: {loadExtensions: []},
    },
};
