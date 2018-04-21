const router = require('express').Router();

router.get('/product', require('./product/get'));
router.get('/product/:id', require('./product/getOne'));

router.get('/shop', require('./shop/get'));

module.exports = router;
