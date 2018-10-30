const mongooes = require('mongoose');
const mongoosastic = require('mongoosastic');

let schema  = mongooes.Schema;
let productSchema = new schema({
    category:{type:schema.Types.ObjectId ,es_type:'text', ref:'Category'},
    author:{type:schema.Types.ObjectId ,es_type:'text', ref:'user'},
    name:{type:String,es_type:'text'},
    price:{type:Number,es_type:'long'},
    discount:{type:Number,es_type:'long',default:0},
    description:{type:String,es_type:'text'},
    shortDescription:{type:String,es_type:'text'},
    colors:[{type:String,es_type:'text'}],
    size:[{type:String,es_type:'text'}],
    image:[{type:String,es_type:'text'}]
});

productSchema.plugin(mongoosastic);
productSchema.plugin(mongoosastic, {
    hosts:['https://h7tvgxhfoi:77u43qq0qh@jask-1-8333156367.us-west-2.bonsaisearch.net']
});


let productModel = mongooes.model("Product",productSchema);

module.exports = productModel;