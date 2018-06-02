exports.seed = async (knex, Promise) => {
    // Delete all rows
    await knex('user').del();

    // Add new rows
    await knex('user').insert([
        {
            id: 1,
            email: 'gersomvg@gmail.com',
            password:
                'bd2074482305fd563c95fbc75ff332785f83ffc523abfcf90905060f0d278bbab94d5fa922e9a77c167d2b4614fd5e7f3cc89bfc6a3e2d26517043b7697ec852',
            firstName: 'Gersom',
            lastName: 'van Ginkel',
            superAdmin: true,
        },
    ]);
    await knex.raw('ALTER SEQUENCE user_id_seq RESTART WITH 2');
};
