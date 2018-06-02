const crypto = require('crypto');

const hashPassword = password =>
    crypto.pbkdf2Sync(password, process.env.PW_SALT, 100000, 64, 'sha512').toString('hex');

module.exports = hashPassword;
