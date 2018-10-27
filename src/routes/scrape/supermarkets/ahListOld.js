const ahList = async ({browser, searchQuery}) => {
    const page = await browser.newPage();
    await page.setViewport({
        width: 1920,
        height: 4000,
    });
    await page.goto(`https://www.ah.nl/zoeken?rq=${encodeURIComponent(searchQuery)}`);

    const timeStart = new Date().getTime() / 1000;
    const waitAndEvaluate = async () => {
        await page.waitFor(200);
        const items = await page.evaluate(() => {
            if (window.innerHeight < 8000) window.scrollBy(0, window.innerHeight);
            const urls = [];
            const elms = document.getElementsByClassName('product__content--link');
            for (let elm of elms) {
                const detailsUrl = elm.href;
                const thumbUrl = elm.getElementsByClassName('product-image')[0].src;
                const name = elm.getElementsByClassName('product-description__title')[0]
                    .textContent;
                const unitElm = elm.getElementsByClassName('product-description__unit-size')[0];
                const unit = unitElm ? unitElm.textContent : null;
                if ((thumbUrl, detailsUrl, name, unit)) {
                    urls.push({thumbUrl, detailsUrl, name, unit});
                }
            }
            return urls;
        });
    };
    return items.slice(0, 20);
};

module.exports = ahList;
