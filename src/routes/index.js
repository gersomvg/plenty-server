const router = require('express').Router();

router.get('/product', require('./product/get'));
router.get('/product/:id', require('./product/getOne'));

module.exports = router;
