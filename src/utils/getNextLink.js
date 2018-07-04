const qs = require('./qs');

const getNextLink = ({total, limit, offset, path, params}) => {
    let nextLink = null;
    const hasNext = total > limit + offset;
    if (hasNext) {
        const $params = qs.stringify({
            ...params,
            limit,
            offset: limit + offset,
        });
        nextLink = `${process.env.BASE_URL}${path}${$params}`;
    }
    return nextLink;
};

module.exports = getNextLink;
