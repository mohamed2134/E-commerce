const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const {User}   = require('../models/Users');




passport.serializeUser(function(user, done) {
    done(null, user._id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});


// passport middleware
passport.use('local-login',new LocalStrategy(
    {
        usernameField: 'email',
        passwordField: 'password',
        session: true,
        passReqToCallback: true
    }
    ,
    function(req,email, password, done) {
        User.findOne({ 'email': email }, function (err, user) {
            if (err) { return done(err); }
            if (!user) {
                req.session.errors=['user not found'];
                return done(null, false);
            }
           user.cheachPasssword(password).then(
               (resl)=>{
                   if(!resl) {
                       req.session.errors = ['wrong password'];
                       return done(null, false);
                   }
                   return done(null, user);
               },
               (err)=>{
                   return done(null,false);
               }
           );

        });
    }
));




module.exports = passport;