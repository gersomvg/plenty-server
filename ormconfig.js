if (!process.env.DATABASE_URL) require('dotenv').config();

module.exports = {
    type: 'postgres',
    url: process.env.DATABASE_URL,
    ssl: true,
    synchronize: process.env.NODE_ENV === 'development',
    migrationsRun: true,
    logging: false,
    entitySchemas: require('./src/schemas'),
    migrations: ['src/migrations/*.js'],
    cli: {
        migrationsDir: 'src/migrations',
    },
};
