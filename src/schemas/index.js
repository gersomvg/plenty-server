const schemas = [];

require('fs')
    .readdirSync(__dirname)
    .forEach(file => {
        if (file !== 'index.js') schemas.push(require(`./${file}`));
    });

module.exports = schemas;
