const fetch = require('node-fetch');
const _ = require('lodash');

const ahDetails = async ({url}) => {
    const response = await fetch(url);
    const data = await response.json();
    const lanes = data._embedded.lanes;

    const product = lanes.find(lane => lane.type === 'ProductDetailLane')._embedded.items[0]
        ._embedded.product;
    const image = product.images ? product.images.find(img => img.width > 700) : null;

    const storyLanes = lanes.filter(lane => lane.type === 'StoryLane');
    const storyItems = _.flatten(storyLanes.map(lane => lane._embedded.items));
    const storySections = _.flatten(storyItems.map(lane => lane._embedded.sections));
    let ingredients = null;
    storySections.forEach(section => {
        const {content} = section._embedded;
        const titleIndex = content.findIndex(
            item => item.type === 'StorySectionTitle' && item.text.title === 'Ingrediënten',
        );
        const ingredientsContent = content[titleIndex + 1];
        if (ingredientsContent && ingredientsContent.type === 'StorySectionParagraph') {
            ingredients = ingredientsContent.text.body.replace(/^Ingrediënten: /, '');
        }
    });

    const details = {
        imageUrl: image && image.link.href,
        name: product.description,
        brand: product.brandName,
        unit: product.unitSize,
        ingredients,
    };
    return details;
};

module.exports = ahDetails;
