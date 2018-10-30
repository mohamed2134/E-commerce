const mongooes = require('mongoose');
const mongoosastic = require('mongoosastic');

let schema  = mongooes.Schema;

let reviewSchema = new schema({
    owner:{type:schema.Types.ObjectId,ref:'user'},
    productID:{type:schema.Types.ObjectId,ref:'product'},
    name:String,
    date:{
        day:String,
        month:String,
        year:String
    },
    body:String,
    rating:Number

});


let reviewModel = mongooes.model('review',reviewSchema);

module.exports = reviewModel;