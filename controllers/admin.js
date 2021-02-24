const { ObjectId } = require('mongodb');
const Product = require('../models/product');
const fs =require('fs');
const fileHelper = require('../util/file');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
    isAuthenticated: req.session.isLoggedIn
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const image = req.file;
  const price = req.body.price;
  const description = req.body.description;
  // console.log(title);
  console.log(image);
  if(image == undefined)
  {
    console.log('Please upload the file in the mentioned format');
    return res.render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false,
      isAuthenticated: req.session.isLoggedIn
    });
  }
  const product = new Product({
    title: title,
    price: price,
    description: description,
    imageUrl: image.path,
    userId: req.user
  });
  product
    .save()
    .then(result => {
      // console.log(result);
      console.log('Created Product');
      res.redirect('/admin/products');
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      if (!product) {
        return res.redirect('/');
      }
      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: editMode,
        product: product,
        isAuthenticated: req.session.isLoggedIn
      });
    })
    .catch(err => console.log(err));
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedImage = req.file;
  const updatedDesc = req.body.description;

  if(!updatedImage)
  {
    return Product.findById(prodId)
    .then(product => {
      if(product.userId.toString() !== req.user._id.toString())
      {
        return res.redirect('/');
      }
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.description = updatedDesc;
      if(image)
      {
        fileHelper.deleteFile('/home/mongu_panda/Downloads/Compressed/[FreeCourseSite.com] Udemy - NodeJS - The Complete Guide (incl. MVC, REST APIs, GraphQL)/practice (nosql)/images/1613546719026-image.jpg');
        product.imageUrl = updatedImage.path; 
      }
      return product.save()
        .then(result => {
          console.log('UPDATED PRODUCT!');
          res.redirect('/admin/products');
        })
        .catch(err => console.log(err));
    })
    .catch(err => console.log(err));
  }

  
};

exports.getProducts = (req, res, next) => {
  // console.log(ObjectId.isValid(req.user._id));
  Product.find({userId: req.user._id})
    .then(products => {
      // console.log(ObjectId.isValid(products[0].userId));
      res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: '/admin/products',
        isAuthenticated: req.session.isLoggedIn
      });
    })
    .catch(err => console.log(err));
};

exports.deleteProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
  .then(product=> {
    fileHelper.deleteFile(product.imageUrl);
    return Product.deleteOne({_id: prodId,userId: req.user._id});
  })
  .then(() => {
    console.log('DESTROYED PRODUCT');
    // res.redirect('/admin/products');
    res.status(200).json({
      message: "Success"
    })
  })
  .catch(err => {
    res.status(500).json({message: 'Failed'});
  });
};