var express = require('express');
var router = express.Router();
let {User} = require('../models/Users');
let Cart = require('../models/cart');
let Product = require('../models/Product');
let Review = require('../models/reviews');
let Order = require('../models/order');
let constant = require('../config/constants');
const authMiddleware = require('../middleware/authUser');
const {userValidation} = require('./validations/userinfo');
const passport = require('passport');
const sessionConfig = require('../config/session');



/* Post users listing. */
router.post('/signup', function (req, res, next) {

    let email = req.body.email;
    let password = req.body.password;
    let name = req.body.name;
    let country = req.body.country;
    let state = req.body.state;
    let town = req.body.town;
    let phone = req.body.phone;
    let newUser = new User({email, password, "profile.name": name,
        'address.country':country,
        'address.state':state,
        'address.city':town,
        'address.phone':phone
    });
    newUser.profile.picture = newUser.gravatar();

    userValidation(newUser).then(
        (errors) => {
            req.session.errors = errors;
            res.redirect('/signup');
        }
        ,
        (noerr) => {
            console.log("not exist mail")
            newUser.save().then(
                (user) => {

                    let newCart = new Cart();
                    newCart.owner = user._id;
                    newCart.save(function (err) {
                        if (err) return next(err);
                        req.logIn(user, function (err) {
                            if (err)
                                return next(err);
                            res.redirect('/profile');
                        })

                    });

                },
                (err) => {
                    req.session.errors = [err.message];
                    res.redirect('/signup');
                }
            );

        }
    ).catch((err) => {
        req.session.errors = [err.message];
        res.redirect('/signup');
    });


});


router.get('/signup', function (req, res, next) {
    let errors = req.session.errors;
    req.session.errors = [];
    if (!req.user)
        return res.render('accounts/signup', {title: "signup", errors: errors});
    res.redirect('/');


});
//*******************************************
//**********************  login route
//*******************************************
router.get('/login', function (req, res, next) {
    let errors = req.session.errors;
    console.log(errors);
    req.session.errors = [];
    if (!req.user)
        return res.render('accounts/login', {title: 'login', errors: errors});
    res.redirect('/');
});

router.post('/login', sessionConfig.generateID, passport.authenticate('local-login', {failureRedirect: '/login'}),
    function (req, res) {
        if(req.user.role === 'admin')
           return res.redirect('/admin-dashboard');
        res.redirect('/profile');
    }
);
//*******************************************
//**********************  start of rstriction area
//*******************************************

router.use(authMiddleware.checkDefaultUser);


//*******************************************
//**********************  logout route
//*******************************************


router.get('/Logout', function (req, res, next) {
    req.session.destroy(function (err) {
        if (err)
            return next(err);
        res.redirect('/login');
    });
});


router.get('/profile', function (req, res, next) {



    let message = req.session.message ? req.session.message:"";
    req.session.message = "";
    Order.find({owner:req.user._id,status:{$ne:constant.order.CANCELED}})
        .then(
            (orders)=>{
                return res.render('accounts/profiles', {user: req.user,orders:orders,message:message, title: 'profile'});
            }
            ,
            (err)=>{
                 return next(err);
            }
        );



});

//*******************************************
//**********************  edit profile
//*******************************************

router.get('/edit-profile', function (req, res, next) {

    let errors = req.session.errors;
    let message = req.session.message;
    req.session.errors = [];
    req.session.message = null;
    res.locals.errors = errors;
    res.locals.message = message;
    return res.render('accounts/edit-profile', {title: 'edit-profile'});
});


router.post('/edit-profile', function (req, res, next) {

    if (req.body.name.length < 5) {
        req.session.message = '';
        req.session.errors = ['user length must be greater than 5 chars'];
        res.redirect('/edit-profile')
    }

    if (req.body.name) req.user.profile.name = req.body.name;
    if (req.body.country) req.user.address.country = req.body.country;
    if (req.body.phone) req.user.address.phone = req.body.phone;
    if (req.body.state) req.user.address.state = req.body.state;
    if (req.body.town) req.user.address.city = req.body.town;

    req.user.save().then(
        (resl) => {
            req.session.message = "successfully edit your profile";
            return res.redirect('/profile');
        }
    ).catch((err) => {
        return next(err);
    });


});


//*******************************************
//**********************  add product to cart
//*******************************************

router.post('/product-cart/:id', function (req, res, next) {
    let id = req.params.id;
    Cart.findOne({owner: req.user._id}, function (err, cart) {

        if (err)
            return next(err);
        if (cart) {
            Product.findById(id, (err, product) => {
                console.log("*************************", product);
                if (err)
                    return next(err);
                if (product) {
                    cart.items.push({
                        item: product._id,
                        price: calculatePrice(product.price,product.discount,req.body.quantity),
                        quantity: parseInt(req.body.quantity)
                    });
                    cart.total = (parseFloat(cart.total) + parseFloat(calculatePrice(product.price,product.discount,req.body.quantity))).toFixed(2);
                    cart.save().then(
                        (reslt) => {
                            return res.redirect('/cart');
                        },
                        (err) => {
                            if (err) return next(err);
                        });

                }
            });
        }


    });


});


//*******************************************
//**********************  get cart route
//*******************************************


router.get('/cart', (req, res, next) => {
    res.locals.message ="";
    Cart.findOne({owner: req.user._id})
        .populate('items.item')
        .exec(
            function (err, cart) {
                if (cart) {
                    console.log(cart);
                    if(cart.items.length < 1)
                        res.locals.message = "cart is empty";
                    res.locals.cart = cart;
                    return res.render('accounts/cart', {title: 'cart'});
                }
                if (err) {
                    return next(err);
                }

            });
});

//*******************************************
//**********************  remove from cart route
//*******************************************

router.get('/cart-remove/:index',(req,res,next)=>{

    let index = req.params.index;
    console.log(index);
    Cart.findOne({owner: req.user._id})
        .populate('items.item')
        .exec(  (err,cart)=>{
            if(err) return next(err);
            if(cart){

                cart.total = (parseFloat(cart.total) - parseFloat(cart.items[index].price)).toFixed(2);
                cart.items.splice(index,1);
                cart.save().then(
                    (cart)=>{
                        return res.redirect('/cart');
                    },
                    (err)=>{
                        return next(err);
                    }
                );
            }
        });


});

//*******************************************
//**********************  checkout cart route and save order
//*******************************************

router.get('/check-out',(req,res,next)=>{

    res.locals.message = "";
    Cart.findOne({owner: req.user._id})
        .exec(  (err,cart)=>{
             console.log(cart.items);
            if(err) return next(err);
            if(cart.items.length > 0){
               saveOrder(cart,req,res,next);
            }else {
               return   res.redirect('/cart');
            }

        });

});

 function saveOrder(cart,req,res,next){
     let newOrder = new Order();
     let date = new Date();
     newOrder.owner = req.user._id;
     newOrder.date.year = date.getFullYear();
     newOrder.date.month = date.getMonth()+1;
     newOrder.date.day = date.getDate();
     newOrder.date.hour = date.getHours();
     newOrder.date.minute = date.getMinutes();
     newOrder.total_cost = cart.total;
     newOrder.status = constant.order.WAITING,
         newOrder.items = cart.items;
     newOrder.save().then(
         (order)=>{
             console.log(order);
             cart.total = 0;
             cart.items = [];
             cart.save().then(
                 (cart)=>{
                     console.log(cart);
                     req.session.message = "new order added";
                     return res.redirect('/profile');
                 },
                 (err)=> next(err)
             );

         },
         (err)=>{
             return next(err);
         }
     );


 }

//*******************************************
//**********************  order details
//*******************************************
router.get('/orders/:id',(req,res,next)=>{
     let id = req.params.id;

     Order.findOne({_id:id})
         .populate('items.item')
         .populate('owner')
         .exec((err,order)=>{
             console.log('**************',order);
         if(order){
             res.locals.order = order;
            return res.render('accounts/order',{title:'order'});
         }
         if(err){
             return next(err);
         }
    }
     );


});


//*******************************************
//**********************  cancel  order
//*******************************************
router.get('/order/cancel/:id',(req,res,next)=>{

    let id= req.params.id;

    Order.findById(id).then(
        (order)=>{
            order.status = constant.order.CANCELED;
            order.save((err,result)=>{
                if(err) return next(err);
                req.session.message = 'order deleted successfully';
                return res.redirect('/profile');
            });

        },
        (err)=>{
            return next(err);
        }
    );


});


//*******************************************
//**********************  add review
//*******************************************
router.post('/product/review/:id',(req,res,next)=> {

    let productId = req.params.id;
    let message = req.body.message;
    let rating = req.body.rate;
    let  name = req.body.subject;

    let newReview = new Review();
    let date = new Date();
    newReview.owner = req.user._id;
    newReview.productID = productId;
    newReview.body = message;
    newReview.rating = rating;
    newReview.name = name;
    newReview.date.day = date.getDate();
    newReview.date.month = date.getMonth();
    newReview.date.year= date.getFullYear();

    console.log(newReview);
    newReview.save().then(
      (review)=>{
          return res.redirect('/product/'+productId);
      },
      (err)=>{
          return next(err);
      }
  );




});


function calculatePrice(price,discount,quantity){

    let disamount = (parseFloat(price)*(parseFloat(discount)/100));
    let newprice = price - disamount;
    let totalPrice = (newprice * quantity).toFixed(2);
    return totalPrice;

}



module.exports = router;
