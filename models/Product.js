const mongooes = require('mongoose');

let schema  = mongooes.Schema;
let productSchema = new schema({
    category:{type:schema.Types.ObjectId , ref:'Category'},
    name:String,
    price:Number,
    image:[]
});

let productModel = mongooes.model("Product",productSchema);

module.exports = productModel;