const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
    pageTitle: 'Add Product', 
    path : '/admin/add-product', 
    editing: false
    }
    );
}

exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const price = req.body.price;
    const description = req.body.description
    //const  userId = req.user._id;
    const product = new Product({
        title: title,
        imageUrl: imageUrl,
        price: price,
        description: description,
        userId: req.suser._id        
    });
    product.save()
    .then(result => {
        res.redirect('/admin/products');
    })
    .catch(err => {
        console.log(err);
    });
    
  }

  exports.getEditProduct = (req, res, next) => {
      const editMode = req.query.edit;
      if(!editMode){
          return res.redirect('/');
      }
      const prodId = req.params.productId;
      Product.findById(prodId)
      .then(product => {
            if(!product){
                res.redirect('/');
            }
          res.render('admin/edit-product', {
              pageTitle: 'Edit Product', 
              path : '/admin/edit-product',
              editing: editMode,
              product: product
        });
    });
    };


exports.postEditProduct = (req, res, next) => {
    const prodId = req.body.productId;
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const price = req.body.price;
    const description = req.body.description;
    
    Product.findById(prodId)
    .then(product => {
        if(product.userId.toString() !== req.user._id.toString()){
            return res.redirect('/');
        }
        product.title = title;
        product.imageUrl = imageUrl;
        product.price = price;
        product.description = description;
        return product
        .save()
        .then(result => { 
            console.log('UPDATED PRODUCT');
            res.redirect('/admin/products');
        });
    })
    
    .catch(err => console.log(err));
};


exports.postDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    Product.deleteOne({_id: prodId, userId: req.user._id}).then(() => {
        console.log('PRODUCT DESTROYED');
        res.redirect('/admin/products');
    })
    .catch(err => {
        console.log(err);
    });
    
};

exports.getProducts = (req, res, next) => {
    Product.find({userId: req.user._id})
    .then(products => {
        res.render('admin/products', 
        {

            prods: products, 
            pageTitle: 'Admin Products',
            path:'/admin/products'
        });
    });
};
