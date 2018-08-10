const getFileUrl = ({filename, size, type}) => {
    const parts = filename.split('.');
    const extension = parts.pop();
    const newFilename = `${parts.join('')}.${size ? `${size}.` : ''}${extension}`;
    const typeFolder = {product: 'products', shop: 'shops'}[type];
    return `https://${process.env.AWS_BUCKET}.${
        process.env.AWS_ENDPOINT
    }/${typeFolder}/${newFilename}`;
};

module.exports = getFileUrl;
