const unaccent = string => {
    if (typeof string !== 'string') return string;
    return string.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

module.exports = unaccent;
