const jsonwebtoken = require('jsonwebtoken');
const CONFIG = require('../config');

const sign = payload => {
    if (
        !('id' in payload) ||
        !('email' in payload) ||
        !('firstName' in payload) ||
        !('lastName' in payload) ||
        !('superAdmin' in payload)
    ) {
        console.error('JWT signing requires: id, email, firstName, lastName, superAdmin');
    }
    return new Promise((resolve, reject) => {
        const options = {expiresIn: CONFIG.JWT_EXPIRES_IN};
        jsonwebtoken.sign(payload, process.env.JWT_SECRET, options, (err, token) => {
            if (err) return reject(err);
            return resolve(token);
        });
    });
};

const verify = token => {
    return new Promise((resolve, reject) => {
        jsonwebtoken.verify(token, process.env.JWT_SECRET, (err, payload) => {
            if (err) return reject(err);
            return resolve(payload);
        });
    });
};

module.exports = {
    sign,
    verify,
};
