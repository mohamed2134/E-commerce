var express = require('express');
var router = express.Router();
let {User} = require('../models/Users');
let Cart = require('../models/cart');
let Product = require('../models/Product');
const {userValidation} = require('./validations/userinfo');
const passport = require('passport');
const sessionConfig = require('../config/session');


/* Post users listing. */
router.post('/signup', function (req, res, next) {

    let email = req.body.email;
    let password = req.body.password;
    let name = req.body.name;
    let newUser = new User({email, password, "profile.name": name});
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
        res.redirect('/profile');
    }
);
//*******************************************
//**********************  start of rstriction area
//*******************************************

router.use(function (req, res, next) {
    if (!req.user) {
        return res.redirect('/login');
        // return next('router');
    }
    next();
});
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

    return res.render('accounts/profiles', {user: req.user, title: 'profile'});

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
    if (req.body.address) req.user.address.address = req.body.address;

    req.user.save().then(
        (resl) => {
            req.session.message = "successfully edit your profile";
            return res.redirect('/edit-profile');
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
                        price: (parseFloat(product.price) * parseInt(req.body.quantity)).toFixed(2),
                        quantity: parseInt(req.body.quantity)
                    });
                    cart.total = (parseFloat(cart.total) + parseFloat(product.price) * parseFloat(req.body.quantity)).toFixed(2);
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

    Cart.findOne({owner: req.user._id})
        .populate('items.item')
        .exec(
            function (err, cart) {
                if (cart) {
                    console.log(cart);
                    res.locals.cart = cart;
                    return res.render('accounts/cart', {title: 'cart'});
                }
                if (err) {
                    return next(err);
                }

            });
});


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
module.exports = router;
