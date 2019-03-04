const path = require('path');

const express = require('express');

const adminData = require('./admin');

const shopController = require('../controllers/shop');

const router = express.Router();

router.get('/', shopController.getIndex);

router.get('/products', shopController.getProducts);

router.get('/cart', shopController.getCart);

router.get('/checkouts', shopController.getCheckout);

module.exports = router;
