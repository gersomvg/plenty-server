const express = require('express');

const router = express.Router();

router.post('/auth', require('./auth/post'));

router.get('/product', require('./product/get'));
router.get('/product/:id', require('./product/getOne'));
router.get('/product/barcode/:barcode', require('./product/getOneByBarcode'));
router.post('/product', require('./product/post'));
router.put('/product/:id', require('./product/put'));

router.get('/shop', require('./shop/get'));

router.get('/category', require('./category/get'));

router.get('/brand', require('./brand/get'));
router.post('/brand', require('./brand/post'));
router.put('/brand/:id', require('./brand/put'));

module.exports = router;
