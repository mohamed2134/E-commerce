var express = require('express');
var router = express.Router();
let Product = require('../models/Product');

/* GET home page. */
router.get('/', function(req, res, next) {

  res.render('main/index', { title: 'home'});
});


router.get('/about', function(req, res, next) {
    res.render('main/index', { title: 'about' });
});

///   main products routes
     //get route by id
router.get('/product/:id',(req,res,next)=>{
    let id = req.params.id;
    console.log(id);
    Product.find({_id:id})
        .populate('category')
        .exec(
            (err,product)=>{
                if(err) {
                    console.log("error",err);
                    return next(err);
                }
                res.locals.product  = product[0];
                res.render("main/product",{title:'product'});
            }
        );
});
    ///  get products with category
router.get('/products/:id',(req,res,next)=>{

    let id = req.params.id;
    Product.find({category:id})
        .populate('category')
        .exec((err,products)=>{
            if(err){
                return next(err);
            }
            console.log(products);
            return res.render('main/products',{products:products,title:'products'});
        });

});


module.exports = router;
