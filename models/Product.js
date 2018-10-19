const mongooes = require('mongoose');
const mongoosastic = require('mongoosastic');

let schema  = mongooes.Schema;
let productSchema = new schema({
    category:{type:schema.Types.ObjectId ,es_type:'text', ref:'Category'},
    name:{type:String,es_type:'text'},
    price:{type:Number,es_type:'long'},
    description:{type:String,es_type:'text'},
    image:[{type:String,es_type:'text'}]
});

productSchema.plugin(mongoosastic);
productSchema.plugin(mongoosastic, {
    hosts:['https://h7tvgxhfoi:77u43qq0qh@jask-1-8333156367.us-west-2.bonsaisearch.net']
});


let productModel = mongooes.model("Product",productSchema);

module.exports = productModel;