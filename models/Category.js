const mongooes = require('mongoose');

let schema  = mongooes.Schema;
let categorySchema = new schema({
    name:{type:String , unique:true , lowercase:true}
});

let categoryModel = mongooes.model('Category',categorySchema);

module.exports = categoryModel;