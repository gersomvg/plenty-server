const fetch = require('node-fetch');

const ahList = async ({searchQuery}) => {
    const response = await fetch(
        `https://www.ah.nl/service/rest/zoeken?rq=${encodeURIComponent(
            searchQuery,
        )}&searchType=product`,
    );
    const data = await response.json();
    const searchLane = data._embedded.lanes.find(lane => lane.type === 'SearchLane');
    if (!searchLane) return [];
    const items = searchLane._embedded.items
        .filter(item => item.resourceType === 'Product')
        .slice(0, 20)
        .map(item => {
            const product = item._embedded.product;
            const thumbImg = product.images ? product.images.find(img => img.width === 200) : null;
            const detailsUrl = `https://www.ah.nl/service/rest${item.navItem.link.href}`;
            return {
                name: product.description,
                brand: product.brandName,
                unit: product.unitSize,
                thumbUrl: thumbImg ? thumbImg.link.href : null,
                detailsUrl,
            };
        });
    return items;
};

module.exports = ahList;
