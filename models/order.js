const mongooes = require('mongoose');
let schema  = mongooes.Schema;

let orderSchema = new schema({
    owner:{type:schema.Types.ObjectId,ref:'user'},
    date: {
        year:String,
        month:String,
        day:String,
        hour:String,
        minute:String
    },
    delivery_cost:String,
    status:String, //shiped,waiting,canceled
    items:[
        {
            item: {type:schema.Types.ObjectId, ref:'Product'},
            quantity:{type:Number, default:1},
            price:{type:Number,default:0}
        }
    ],
    total_cost:Number,
    paid_method:{type:String , default:"on deliver"}   // credit card , on delivery

});



let orderModel = mongooes.model('order',orderSchema);

module.exports = orderModel;