const Barcode = require('../models/BarcodeModel');
const Product = require('../models/ProductModel');

module.exports = {
    target: Barcode,
    columns: {
        code: {
            primary: true,
            type: 'varchar',
            length: 100,
        },
    },
    relations: {
        product: {
            target: () => Product,
            type: 'many-to-one',
            onDelete: 'CASCADE',
            eager: true,
            nullable: false,
        },
    },
};
