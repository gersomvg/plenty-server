exports.seed = async (knex, Promise) => {
    // Delete all rows
    await knex('feedback').del();

    // Add new rows
    await knex('feedback').insert([
        {
            id: 1,
            message: "Deze oreo's crispy&thin staat nog niet in jullie app. Ze zijn ook vegan! :) ",
            barcode: '7622210681430',
        },
        {
            id: 2,
            message:
                'Volgens mij klopt de informatie hier niet. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur nec euismod tellus. Nullam vestibulum sagittis molestie. Curabitur aliquam metus non nulla laoreet, eget condimentum lorem cursus. Donec non tortor vitae felis dictum lobortis. Integer nulla tortor, rutrum eget urna vitae, luctus venenatis leo. Suspendisse ullamcorper est ut nisi pretium, quis sollicitudin ex bibendum. Donec hendrerit augue ac augue commodo, egestas iaculis nisi volutpat. Sed eu nulla tincidunt, dictum magna vitae, tempor ipsum.',
            productId: 8,
        },
        {
            id: 3,
            message: "Oh en de oreo's double creme ook nog niet",
            barcode: '7622210137234',
        },
        {
            id: 4,
            message:
                'De Bi­o­Ban­dits Egg free mayo or­ga­nic ve­gan bio staat nog niet in de app!',
            barcode: '8718421271320',
            archived: true,
        },
    ]);
    await knex.raw('ALTER SEQUENCE feedback_id_seq RESTART WITH 5');
};
