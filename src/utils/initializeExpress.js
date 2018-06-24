const express = require('express');

const initializeExpress = () => {
    const app = express();

    // Enable CORS headers in development/staging
    if (process.env.NODE_ENV !== 'production') app.use(require('cors')());

    // Enable automatic parsing of JSON bodies
    app.use(express.json());

    // Disable express mention in headers
    app.disable('x-powered-by');

    // Add versioning to API paths
    app.use('/api/v1', require('../routes'));

    // Error handler middleware
    app.use(require('./errorMiddleware'));

    // Start listening for requests
    app.listen(process.env.PORT, () => console.log(`App listening from ${process.env.PORT}`));
};

module.exports = initializeExpress;
