const Knex = require('knex');
const {Model} = require('objection');
const knexConfig = require('../../knexfile');

const makeDatabaseConnection = () => {
    const knex = Knex(knexConfig[process.env.NODE_ENV]);
    Model.knex(knex);
};

module.exports = makeDatabaseConnection;
