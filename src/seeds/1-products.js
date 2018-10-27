exports.seed = async (knex, Promise) => {
    // Delete all rows
    await knex('barcode').del();
    await knex('product_shop').del();
    await knex('product').del();
    await knex('brand').del();
    await knex('shop').del();

    await knex.raw('ALTER SEQUENCE product_id_seq RESTART WITH 1');
    await knex.raw('ALTER SEQUENCE brand_id_seq RESTART WITH 1');
    await knex.raw('ALTER SEQUENCE category_id_seq RESTART WITH 1');

    await knex('brand').insert([
        {name: 'Vegetarische Slager'},
        {name: 'Jumbo'},
        {name: 'Albert Heijn'},
        {name: 'CêlaVita'},
    ]);
    await knex.raw('ALTER SEQUENCE brand_id_seq RESTART WITH 5');

    await knex('shop').insert([
        {code: 'ah', name: 'Albert Heijn'},
        {code: 'jumbo', name: 'Jumbo'},
        {code: 'lidl', name: 'Lidl'},
        {code: 'aldi', name: 'Aldi'},
    ]);

    await knex('category').insert([
        {name: 'Broodbeleg'},
        {name: 'Zoete tussendoortjes'},
        {name: 'Hartige tussendoortjes'},
        {name: 'Vleesvervangers'},
        {name: 'Zuivelvervangers'},
    ]);
    await knex.raw('ALTER SEQUENCE category_id_seq RESTART WITH 6');

    await knex('product').insert([
        {
            name: 'Petit Paté',
            brandId: 1,
            customImage: 'petit-pate.jpg',
            classification: 'YES',
            explanation: 'Expliciet vermeld op de verpakking',
        },
        {
            name: "Petit Filet à l'Americain",
            brandId: 1,
            customImage: 'petit-file.jpg',
            classification: 'YES',
            explanation: 'Expliciet vermeld op de verpakking',
        },
        {
            name: 'Boterhamworst',
            brandId: 1,
            customImage: 'boterhamworst.jpg',
            classification: 'YES',
            explanation: 'Expliciet vermeld op de verpakking',
        },
        {
            name: 'Kipworst',
            brandId: 1,
            customImage: 'kipworst.jpg',
            classification: 'NO',
            explanation: 'Bevat kippenei',
        },
        {
            name: 'Italiaanse Worst',
            brandId: 1,
            customImage: 'italiaanse-worst.jpg',
            classification: 'NO',
            explanation: 'Bevat kippenei',
        },
        {
            name: 'Boterhamworst Provençaal',
            brandId: 1,
            customImage: 'boterhamworst-provencaal.jpg',
            classification: 'YES',
            explanation: 'Expliciet vermeld op de verpakking',
        },
        {
            name: 'Gelderse Worst',
            brandId: 1,
            customImage: 'gelderse-worst.jpg',
            classification: 'NO',
            explanation: 'Bevat kippenei',
        },
        {
            name: 'Oranjekoek Stukjes',
            brandId: 2,
            officialImage: 'oranjekoek-stukjes.jpg',
            classification: 'NO',
            explanation: 'Bevat vitamine D3, dat meestal uit schapenwol wordt gewonnen',
        },
        {
            name: 'Creamy Kokos Naturel',
            brandId: 3,
            officialImage: 'creamy-kokos-naturel.jpg',
            classification: 'YES',
        },
        {
            name: 'Country Partjes Rozemarijn Zeezout',
            brandId: 4,
            officialImage: 'country-partjes.jpg',
            classification: 'MAYBE',
        },
        {
            name: 'Tor­til­la wraps meer­gra­nen',
            brandId: 3,
            officialImage: 'wraps.jpg',
            classification: 'YES',
        },
    ]);
    await knex.raw('ALTER SEQUENCE product_id_seq RESTART WITH 12');
    await knex.raw('REFRESH MATERIALIZED VIEW search_index');

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
        {productId: 11, shopCode: 'ah'},
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
