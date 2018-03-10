// Initializes dotenv
require('./src/config');

const initializeDatabaseConnection = async () => {
    try {
        require('reflect-metadata');
        await require('typeorm').createConnection();
        initializeExpress();
    } catch (e) {
        console.error('Could not make a connection with the database:', e);
    }
};

const initializeExpress = () => {
    const app = require('express')();

    // Enable CORS headers
    app.use(
        require('cors')({
            origin: true,
            methods: ['GET'],
        }),
    );

    // Enable automatic parsing of JSON bodies
    app.use(require('body-parser').json());

    // Disable express mention in headers
    app.disable('x-powered-by');

    // Add versioning to API paths
    app.use('/api/v1', require('./src/routes'));

    // Start listening for requests
    app.listen(process.env.PORT, () => console.log(`App listening from ${process.env.PORT}`));
};

initializeDatabaseConnection();
