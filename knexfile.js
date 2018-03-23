if (!process.env.PG_CONNECTION_STRING) require('dotenv').config();

const common = {
    client: 'pg',
    connection: process.env.PG_CONNECTION_STRING,
    ssl: true,
    migrations: {
        tableName: 'knex_migrations',
        directory: './src/migrations',
    },
    seeds: {
        directory: './src/seeds',
    },
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

        // Disable seeds to prevent them from running on production
        seeds: {loadExtensions: []},
    },
};
