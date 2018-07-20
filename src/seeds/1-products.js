exports.seed = async (knex, Promise) => {
    // Delete all rows
    await knex('barcode').del();
    await knex('product_shop').del();
    await knex('product').del();
    await knex('brand').del();

    // Add new rows
    await knex('brand').insert([
        {id: 1, name: 'Vegetarische Slager'},
        {id: 2, name: 'Jumbo'},
        {id: 3, name: 'Albert Heijn'},
        {id: 4, name: 'CêlaVita'},
    ]);
    await knex.raw('ALTER SEQUENCE brand_id_seq RESTART WITH 5');
    await knex('product').insert([
        {
            id: 1,
            name: 'Petit Paté',
            brandId: 1,
            filename: 'petit-pate.jpg',
            classification: 'YES',
            explanation: 'Expliciet vermeld op de verpakking',
        },
        {
            id: 2,
            name: "Petit Filet à l'Americain",
            brandId: 1,
            filename: 'petit-file.jpg',
            classification: 'YES',
            explanation: 'Expliciet vermeld op de verpakking',
        },
        {
            id: 3,
            name: 'Boterhamworst',
            brandId: 1,
            filename: 'boterhamworst.jpg',
            classification: 'YES',
            explanation: 'Expliciet vermeld op de verpakking',
        },
        {
            id: 4,
            name: 'Kipworst',
            brandId: 1,
            filename: 'kipworst.jpg',
            classification: 'NO',
            explanation: 'Bevat kippenei',
        },
        {
            id: 5,
            name: 'Italiaanse Worst',
            brandId: 1,
            filename: 'italiaanse-worst.jpg',
            classification: 'NO',
            explanation: 'Bevat kippenei',
        },
        {
            id: 6,
            name: 'Boterhamworst Provençaal',
            brandId: 1,
            filename: 'boterhamworst-provencaal.jpg',
            classification: 'YES',
            explanation: 'Expliciet vermeld op de verpakking',
        },
        {
            id: 7,
            name: 'Gelderse Worst',
            brandId: 1,
            filename: 'gelderse-worst.jpg',
            classification: 'NO',
            explanation: 'Bevat kippenei',
        },
        {
            id: 8,
            name: 'Oranjekoek Stukjes',
            brandId: 2,
            filename: 'oranjekoek-stukjes.jpg',
            classification: 'NO',
            explanation: 'Bevat vitamine D3, dat meestal uit schapenwol wordt gewonnen',
        },
        {
            id: 9,
            name: 'Creamy Kokos Naturel',
            brandId: 3,
            filename: 'creamy-kokos-naturel.jpg',
            classification: 'YES',
        },
        {
            id: 10,
            name: 'Country Partjes Rozemarijn Zeezout',
            brandId: 4,
            filename: 'country-partjes.jpg',
            classification: 'MAYBE',
        },
    ]);
    await knex.raw('ALTER SEQUENCE product_id_seq RESTART WITH 11');
    await knex('product_shop').insert([
        {productId: 1, shopCode: 'ah'},
        {productId: 1, shopCode: 'jumbo'},
        {productId: 2, shopCode: 'ah'},
        {productId: 2, shopCode: 'jumbo'},
        {productId: 3, shopCode: 'ah'},
        {productId: 3, shopCode: 'jumbo'},
        {productId: 4, shopCode: 'ah'},
        {productId: 4, shopCode: 'jumbo'},
        {productId: 5, shopCode: 'ah'},
        {productId: 5, shopCode: 'jumbo'},
        {productId: 6, shopCode: 'ah'},
        {productId: 6, shopCode: 'jumbo'},
        {productId: 7, shopCode: 'ah'},
        {productId: 7, shopCode: 'jumbo'},
        {productId: 8, shopCode: 'jumbo'},
        {productId: 9, shopCode: 'ah'},
        {productId: 10, shopCode: 'ah'},
        {productId: 10, shopCode: 'jumbo'},
    ]);
    await knex('product_category').insert([
        {productId: 1, categoryId: 1},
        {productId: 2, categoryId: 1},
        {productId: 3, categoryId: 1},
        {productId: 4, categoryId: 1},
        {productId: 5, categoryId: 1},
        {productId: 6, categoryId: 1},
        {productId: 7, categoryId: 1},
        {productId: 8, categoryId: 2},
        {productId: 9, categoryId: 5},
    ]);
    await knex('barcode').insert([
        {code: '0123456789999', productId: 1},
        {code: '1123456789998', productId: 8},
    ]);
};
