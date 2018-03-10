const Shop = require('../models/ShopModel');

module.exports = {
    target: Shop,
    columns: {
        code: {
            primary: true,
            type: 'varchar',
            length: 100,
        },
        name: {
            type: 'varchar',
            length: 100,
        },
    },
};
