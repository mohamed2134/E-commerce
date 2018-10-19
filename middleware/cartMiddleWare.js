const cart = require('../models/cart');

module.exports.cardLength = function (req,res,next) {

    if (req.user) {

        cart.findOne({owner:req.user._id},(err, cart) => {
                if (err)
                    return next(err);
                if (cart) {
                    let total = 0;
                    for (let i = 0; i < cart.items.length; i++) {
                        total += cart.items[i].quantity;
                    }

                    res.locals.cartItems = total;
                }else {
                    res.locals.cartItems = 0;
                }

                next();

            }
        );
    } else {
        next();
    }
};