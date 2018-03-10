const Product = require('../models/ProductModel');
const Brand = require('../models/BrandModel');
const Barcode = require('../models/BarcodeModel');
const Shop = require('../models/ShopModel');

module.exports = {
    target: Product,
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
    relations: {
        brand: {
            target: () => Brand,
            type: 'many-to-one',
            cascadeInsert: true,
            eager: true,
            nullable: false,
        },
        barcode: {
            target: () => Barcode,
            type: 'one-to-many',
            eager: true,
        },
        shop: {
            target: () => Shop,
            type: 'many-to-many',
            joinTable: {
                name: 'product_shop',
            },
            eager: true,
        },
    },
};
