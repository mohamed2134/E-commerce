const express = require("express");
let router = express.Router();
let Category = require('../models/Category');
let Product = require('../models/Product');
const authMiddleware = require('../middleware/authUser');
let Order = require('../models/order');
let constant = require('../config/constants');


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





//*******************************************
//**********************  start of Admin rstriction area
//*******************************************

//router.use(authMiddleware.checkAdminUser);




//**********************  get category route
router.get('/add-category',(req,res,next)=>{
    res.render('admin/add-category',{title:'add-category', message:req.flash('message'),errors:req.flash('errors')});
});

//********************** add  category route
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

//**********************  get add product route route
router.get('/add-product',(req,res,next)=>{
    res.render('admin/add-product',{title:'add-product', message:req.flash('message'),errors:req.flash('errors')});
});
//**********************  post add product route route
router.post('/add-product',upload.array('image',3),(req,res,next)=>{

   let category = req.body.category;
   let  name = req.body.name;
   let price = req.body.price;
   let discount = req.body.discount;
   console.log("************************",discount);
   let shortdesc = req.body.shortdesc;
   let fulldesc =req.body.fulldesc;
   let color1 = req.body.color1;
   let color2 = req.body.color2;
   let color3 = req.body.color3;
   let size = req.body.size;
   let image = req.publicUrl;
   let product = new Product({category,name,price,image});

    product.discount = discount;
    product.shortDescription = shortdesc;
    product.description = fulldesc;
    product.colors =[color1,color2,color3];
    product.size = size;

   product.save().then(
       (product)=>{
           req.flash('message','product added successfully');
           res.redirect('/add-product');
       }
   ).catch((err)=>next(err));



});


/// start working with dashboard
    // main admin dashboard
router.get('/admin/dashboard',(req,res,next)=>{
    res.render('admin/dashboard',{title:'dashboard'});
});
   // main admin order board
router.get('/admin/dashboard/orders',(req,res,next)=>{
    res.render('admin/dashOrders',{title:'Orders'});
});
  // all orders
router.get('/admin/dashboard/allorders',(req,res,next)=>{

    Order.find({}).sort({'date.date':-1}).then(
        (orders)=>{
            res.locals.orders = orders;
            return res.render('admin/OrdersList',{title:'allOrders'});
        },
        (err)=>{
            return next(err);
        }

        );
});

  // get new orders
router.get('/admin/dashboard/neworders',(req,res,next)=>{

    Order.find({'status':constant.order.WAITING}).sort({'date.date':-1}).then(
        (orders)=>{
            res.locals.orders = orders;
            return res.render('admin/OrdersList',{title:'allOrders'});
        },
        (err)=>{
            return next(err);
        }

    );
});
   // get canceled ordered
router.get('/admin/dashboard/canceledorders',(req,res,next)=>{

    Order.find({'status':constant.order.CANCELED}).sort({'date.date':-1}).then(
        (orders)=>{
            res.locals.orders = orders;
            return res.render('admin/OrdersList',{title:'allOrders'});
        },
        (err)=>{
            return next(err);
        }

    );
});


module.exports = router;