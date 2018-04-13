const qs = require('qs');

const stringify = params => qs.stringify(params, {addQueryPrefix: true, skipNulls: true});

module.exports = {stringify};
