var express = require('express');
var router = express.Router();
const mongooes = require('mongoose');
let Product = require('../models/Product');
let Review = require('../models/reviews');

//config search
   ///connect to mongodb
Product.createMapping((err,mapping)=>{
   if(err){
       console.error("mapping fail",err);
   } else{
       console.log("mapping success",mapping);
   }
});


let stream = Product.synchronize();
let count =0;
stream.on('data', function(){
    count++;
});
stream.on('close', function(){
    console.log('indexed ' + count + ' documents!');
});
stream.on('error', function(err){
    console.log(err);
});














/* GET home page. */
router.get('/', function(req, res, next) {

    if(req.user){
        let perPage = 3;
        let page = req.query.page?req.query.page:0;

        Product.find()
            .skip(perPage*page)
            .populate('category')
            .limit(perPage)
            .exec((err,result)=>{
                if(err)
                    return next(err);
                Product.countDocuments().exec((err,count)=>{
                    if(err) return next(err);

                   let pagenumber = Math.ceil(count/perPage);
                   console.log(pagenumber,count);
                    res.render('main/main-product',{title:'products',results:result,pages:pagenumber,currentpage:page});
                });


            });
    }else{
        res.render('main/index', { title: 'home'});
    }


});


router.get('/about', function(req, res, next) {
    res.render('main/index', { title: 'about' });
});

///   main products routes
     //get route by id
router.get('/product/:id',(req,res,next)=>{
    let id = req.params.id;
    Product.find({_id:id})
        .populate('category')
        .exec(
            (err,product)=>{
                if(err || (typeof product!== "undefined" && product.length<=0)) {
                    console.log("error",err);
                    return next(err);
                }

                Review.find({productID: id})
                    .populate('owner')
                    .exec(
                        (err,Reviews)=>{
                            if(err) return next(err);
                           Review.aggregate([
                                   {$match:{ productID:mongooes.Types.ObjectId(id)}},
                                  {$group: {_id: '$productID', average: {$avg: '$rating'}}}
                               ],
                               (err,reslt)=>{

                                   if(err) return next(err);
                                   if(reslt.length > 0)
                                         res.locals.average = reslt[0].average;
                                   else
                                       res.locals.average = 4;

                                   res.locals.product  = product[0];
                                   res.locals.review  = Reviews;
                                   res.render("main/product",{title:'product'});
                            }
                           );

                        }
                    );

            }
        );
});
    ///  get products with category
router.get('/products/:id',(req,res,next)=>{

    let perPage = 9;
    let page = req.query.page?req.query.page:0;

    let id = req.params.id;
    Product.find({category:id})
        .skip(perPage*page)
        .limit(perPage)
        .populate('category')
        .exec((err,products)=>{
            if(err){
                return next(err);
            }
            Product.find({category:id})
                .exec((err,result)=>{
                    if(err) return next(err);

                    let count = result.length;
                    console.log(count);
                    let pagenumber = Math.ceil(count/perPage);
                    res.render('main/products',{title:'products',products:products,pages:pagenumber,currentpage:page});

                });

        });

});



//   search route
router.get('/search',function(req,res,next){
    let q= req.query['q'];
    console.log(q);
    Product.search({
        query_string: {query: q}
    }, function(err, results) {
        if(err)
            return console.log(err);
        let data = results.hits.hits.map(hit=>hit);
        console.log(data);
        res.locals.results = data;
        res.locals.q=q;
        return res.render('main/search-results',{title:'product'});
    });
});

module.exports = router;
