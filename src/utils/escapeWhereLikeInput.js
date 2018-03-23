// In a Postgres statement such as 'WHERE foo LIKE bar', the _ and % are treated as special
// characters, so in user input those characters need to be escaped
const escapeWhereLikeInput = string => {
    if (typeof string !== 'string') return string;
    return string.replace(/([_%])/g, '\\$1');
};

module.exports = escapeWhereLikeInput;
