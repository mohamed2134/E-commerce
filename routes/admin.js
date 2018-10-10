const express = require("express");
let router = express.Router();
let Category = require('../models/Category');
let Product = require('../models/Product');
var multer  = require('multer');





var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/')
    },
    filename: function (req, file, cb) {
            if(!req.publicUrl)
                req.publicUrl = [];
            let imgUrl ='images/'+Date.now() + '-' + file.originalname;
            req.publicUrl.push('http://localhost:4000/static/'+imgUrl);
            cb(null,imgUrl );

    }
});
let upload = multer({ storage:storage });


router.get('/add-category',(req,res,next)=>{
    res.render('admin/add-category',{title:'add-category', message:req.flash('message'),errors:req.flash('errors')});
});

router.post('/add-category',(req,res,next)=>{

    if(!req.body.name){
        req.flash('errors',["please enter the category name"]);
        return res.redirect('/add-category');
    }
    let category = new Category();
    category.name = req.body.name;
    category.save().then(
        (cat)=>{
            req.flash('message','category added successfully');
            return res.redirect('/add-category');
        }
    ).catch((err)=>{
        return next(err);
    });

});


router.get('/add-product',(req,res,next)=>{
    res.render('admin/add-product',{title:'add-product', message:req.flash('message'),errors:req.flash('errors')});
});

router.post('/add-product',upload.array('image',3),(req,res,next)=>{

   let category = req.body.category;
   let  name = req.body.name;
   let price = req.body.price;
   let image = req.publicUrl;
    let product = new Product({category,name,price,image});
   product.save().then(
       (product)=>{
           req.flash('message','product added successfully');
           res.redirect('/add-product');
       }
   ).catch((err)=>next(err));



});

module.exports = router;