var createError = require('http-errors');
var express = require('express');
var path = require('path');
const {config} = require('./config/secret');
var cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('req-flash');
var logger = require('morgan');
const mongoose = require('./db/connection');
const MongoStore = require('connect-mongo')(session);
const passport = require('passport');
const configpassport = require('./config/passport');
const Category = require('./models/Category');
const {cardLength} = require('./middleware/cartMiddleWare');
const elasticsearch = require('elasticsearch');
var app = express();



// exopress middlewares
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use('/static',express.static(path.join(__dirname, 'public')));
app.use('/static',express.static(path.join(__dirname, 'uploads')));

// session setup
app.use(cookieParser());
app.use(session({
    name: 'amazon-clone',
    secret: config.secret,
    resave: true,
    saveUninitialized: true,
    store: new MongoStore({
        url: config.dbUrl,
        autoRemove: 'native'
    }),
    cookie: {
        secure: false,
        maxAge: 3600000
    }
}));

// passport middlewares
app.use(passport.initialize());
app.use(passport.session());


// global middlewares
app.use(flash());
    //  get  category
app.use(function(req,res,next){
    Category.find({}).then(
        (category)=>{
            res.locals.Category = category;
            return next();
        }
    ).catch((err)=>next(err));
});
    // get cart quantity
app.use(cardLength);


// search configurations


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('ejs', require('ejs-locals'));
app.set('view engine', 'ejs');

// app route middlewares
var indexRouter = require('./routes/main');
var usersRouter = require('./routes/users');
var adminRouter = require('./routes/admin');
//app middlewares for authentication
app.use(function(req,res,next){
    res.locals.user = req.user;
    next();
});

//  app routes
app.use(indexRouter);
app.use(adminRouter);

app.use(usersRouter);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    console.log(err.status);
    // render the error page
    res.status(err.status || 500);
    res.render('main/error');
});

module.exports = app;
