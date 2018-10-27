const puppeteer = require('puppeteer');

const ahDetails = async ({url}) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({
        width: 1000,
        height: 20000,
    });
    await page.goto(url);
    await page.waitFor(1000);
    const details = await page.evaluate(() => {
        const heroElm = document.getElementsByClassName('product--hero')[0];
        return {
            imageUrl: heroElm.getElementsByClassName('product-image')[0].src.split('?')[0],
            name: heroElm.getElementsByClassName('product-description__title')[0].textContent,
            unit: heroElm.getElementsByClassName('product-description__unit-size')[0].textContent,
            ingredients: document.getElementById('ingredienten').nextSibling.textContent,
        };
    });
    return details;
};

module.exports = ahDetails;
