 const Product = require('../models/product');
 const Order = require('../models/order');


exports.getProducts = (req, res, next) => {
    Product.find()
    .then(products => {
        res.render('shop/product-list', 
        {
          prods: products, 
          pageTitle: ' All Products',
          path: '/products' 
          
        });
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
};

exports.postOrder = (req, res, next) => {
    req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
        const products = user.cart.items.map(i => 
            ({ product: { ...i.productId._doc }, quantity: i.quantity }));
        const order = new Order({
            user: {
                email: req.user.email,
                userId: req.user
            },
            products
        });
        return order.save();
        })
        .then(() => req.user.clearCart())
        .then(() => {
            res.redirect('/orders');
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};
    
exports.getProduct = (req, res, next) => {
    const prodId = req.params.productId;
    Product.findById(prodId)
    .then(product => {
        res.render('shop/product-detail', {
            product,
            pageTitle: product.title,
            path: '/products'
        }); 
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
};

exports.getIndex = (req, res, next) => {
    Product.find()
    .then(products => {
        res.render('shop/index', 
        {

            prods: products, 
            pageTitle: 'Shop',
            path: '/' 
            
        });
    }).catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
};


exports.getCart = (req, res, next) => {
    req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
        const products = user.cart.items;
        res.render('shop/cart', 
        {
            pageTitle: 'Your Cart',
            path: '/cart', 
            products
        });
    })
    .catch(err => {      
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
 });    
};


exports.postCart = (req, res, next) => {
    const prodId = req.body.productId;
    Product.findById(prodId).then(product => req.user.addToCart(product))
    .then(() => {
        res.redirect('/cart');
    });
};


exports.postCartDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    req.user
    .removeFromCart(prodId)
    .then(() => {
        res.redirect('/cart');
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
};

exports.getOrders = (req, res, next) => {
    Order.find({ 'user.userId': req.user._id })
    .then(orders => {
        res.render('shop/orders', 
        {
            orders,
            pageTitle: 'Your Orders',
            path: '/orders'
            
        });
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
};  


exports.getCheckout = (req, res, next) => {
         res.render('shop/checkout', 
        {

            pageTitle: 'Checkout',
            path: '/checkout'
            
        }
    );
};
