const Brand = require('../models/BrandModel');

module.exports = {
    target: Brand,
    columns: {
        id: {
            primary: true,
            type: 'int',
            generated: true,
        },
        name: {
            type: 'varchar',
            length: 100,
            nullable: false,
        },
    },
};
