const router = require('express').Router();

router.get('/product/:id', require('./product/getOne'));

module.exports = router;
