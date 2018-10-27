const fetch = require('node-fetch');

const jumboDetails = async ({url}) => {
    const response = await fetch(url);
    const data = await response.json();
    const product = data.product.data;

    const ingredientsArr =
        product.ingredientInfo &&
        product.ingredientInfo.length &&
        product.ingredientInfo[0] &&
        product.ingredientInfo[0].ingredients;
    let ingredients = '';
    if (ingredientsArr) {
        ingredients = ingredientsArr.map(ingr => ingr.name).join(', ');
    }

    const details = {
        imageUrl: product.imageInfo.primaryView.find(img => img.width === 720).url,
        name: product.title,
        unit: product.quantity,
        ingredients,
    };
    return details;
};

module.exports = jumboDetails;
