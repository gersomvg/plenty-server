const _ = require('lodash');
const uuid = require('uuid/v4');

const getFileName = productName => {
    return `${_.kebabCase(productName.substring(0, 64))}-${uuid()}`;
};

const getExtension = fileOrUrl => {
    const isUrl = typeof fileOrUrl === 'string';
    const extension = isUrl ? fileOrUrl.split('.').pop() : fileOrUrl.mimetype.split('/').pop();
    return extension.toLowerCase();
};

const getFullName = (fileName, extension) => {
    if (!fileName || !extension) return null;
    return `${fileName}.${extension}`;
};

module.exports = {getFileName, getExtension, getFullName};
