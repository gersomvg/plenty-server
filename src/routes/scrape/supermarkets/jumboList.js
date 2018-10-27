const fetch = require('node-fetch');

const jumboList = async ({searchQuery}) => {
    const response = await fetch(
        `https://mobileapi.jumbo.com/V3/products?count=20&q=${encodeURIComponent(searchQuery)}`,
    );
    const data = await response.json();
    const items = data.products.data.map(product => ({
        name: product.title,
        unit: product.quantity,
        thumbUrl: product.imageInfo.primaryView.find(img => img.width === 360).url,
        detailsUrl: `https://mobileapi.jumbo.com/V3/products/${product.id}`,
    }));
    return items;
};

module.exports = jumboList;
