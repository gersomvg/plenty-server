require('dotenv').config();
require('node-fetch');
require('./src/utils/makeDatabaseConnection')();
require('./src/utils/initializeExpress')();
