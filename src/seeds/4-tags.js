exports.seed = async (knex, Promise) => {
    // Delete all rows
    await knex('tagTree').del();
    await knex('tag').del();

    // Add new rows
    await knex('tag').insert([
        {name: 'Koken'},
        {name: 'Broodbeleg'},
        {name: 'Internationale keuken'},
        {name: 'Vlees- en kaasvervangers'},
        {name: 'Margarine'},
        {name: 'Smaakmakers'},
        {name: 'Nederlands'},
        {name: 'Mexicaans'},
        {name: 'Brood & granen'},
        {name: 'Wraps'},
        {name: 'Kookroom'},
    ]);
    await knex.raw('ALTER SEQUENCE tag_id_seq RESTART WITH 11');
    await knex('tagTree').insert([
        {tagId: 1, sequence: 10},
        {tagId: 2, sequence: 20},
        {tagId: 3, parentId: 1, sequence: 20},
        {tagId: 4, parentId: 2, sequence: 20},
        {tagId: 5, parentId: 1, sequence: 30},
        {tagId: 5, parentId: 2, sequence: 10},
        {tagId: 6, parentId: 1, sequence: 10},
        {tagId: 7, parentId: 3, sequence: 10},
        {tagId: 8, parentId: 3, sequence: 20},
        {tagId: 9, sequence: 30},
        {tagId: 10, parentId: 9, sequence: 10},
        {tagId: 11, parentId: 1, sequence: 40},
    ]);
    await knex.raw('ALTER SEQUENCE tag_tree_id_seq RESTART WITH 12');
    await knex('productTag').insert([
        {tagId: 4, productId: 1},
        {tagId: 4, productId: 2},
        {tagId: 4, productId: 3},
        {tagId: 4, productId: 4},
        {tagId: 4, productId: 5},
        {tagId: 4, productId: 6},
        {tagId: 4, productId: 7},
        {tagId: 11, productId: 9},
        {tagId: 7, productId: 10},
        {tagId: 8, productId: 11},
        {tagId: 10, productId: 11},
    ]);
    await knex.raw('ALTER SEQUENCE tag_tree_id_seq RESTART WITH 12');
};
