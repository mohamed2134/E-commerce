const mongoose = require('mongoose');
const {config}  = require('../config/secret');
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex',true );
mongoose.Promise = global.Promise;

mongoose.connect(config.dbUrl,{ useNewUrlParser: true},function(err,res){
    if(err){
        return console.log(err);
    }else{
        console.log('connection estaplish successfully');
    }
});

