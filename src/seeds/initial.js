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
    ]);
    await knex.raw('ALTER SEQUENCE brand_id_seq RESTART WITH 4');
    await knex('product').insert([
        {
            id: 1,
            name: 'Petit Paté',
            brand_id: 1,
            filename: 'petit-pate.jpg',
        },
        {
            id: 2,
            name: "Petit Filet à l'Americain",
            brand_id: 1,
            filename: 'petit-file.jpg',
        },
        {
            id: 3,
            name: 'Boterhamworst',
            brand_id: 1,
            filename: 'boterhamworst.jpg',
        },
        {
            id: 4,
            name: 'Kipworst',
            brand_id: 1,
            filename: 'kipworst.jpg',
        },
        {
            id: 5,
            name: 'Italiaanse Worst',
            brand_id: 1,
            filename: 'italiaanse-worst.jpg',
        },
        {
            id: 6,
            name: 'Boterhamworst Provençaal',
            brand_id: 1,
            filename: 'boterhamworst-provencaal.jpg',
        },
        {
            id: 7,
            name: 'Gelderse worst',
            brand_id: 1,
            filename: 'gelderse-worst.jpg',
        },
        {
            id: 8,
            name: 'Oranjekoek Stukjes',
            brand_id: 2,
            filename: 'oranjekoek-stukjes.jpg',
        },
        {
            id: 9,
            name: 'Creamy Kokos Naturel',
            brand_id: 3,
            filename: 'creamy-kokos-naturel.jpg',
        },
    ]);
    await knex.raw('ALTER SEQUENCE product_id_seq RESTART WITH 10');
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
    ]);
};
