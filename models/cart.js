const mongooes = require('mongoose');
let schema  = mongooes.Schema;

let cartSchema = new schema({

    owner:{type:schema.Types.ObjectId,ref:'user'},
    total:{type:Number,default:0},
    items:[
        {
            item: {type:schema.Types.ObjectId, ref:'Product'},
            quantity:{type:Number, default:1},
            price:{type:Number,default:0}
        }
        ]
});

let cartModel = mongooes.model('Cart',cartSchema);


module.exports = cartModel;