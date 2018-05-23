const express = require('express');

const router = express.Router();

router.get('/product', require('./product/get'));
router.get('/product/:id', require('./product/getOne'));
router.get('/product/barcode/:barcode', require('./product/getOneByBarcode'));
router.post('/product', require('./product/post'));

router.get('/shop', require('./shop/get'));

router.get('/category', require('./category/get'));

module.exports = router;
