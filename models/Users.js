const mongoose = require('mongoose');
const validator = require("validator");
const bcrypt = require('bcrypt');
const crypto = require('crypto');

let schema = mongoose.Schema;
let userSchema = new schema(
    {
        profile: {
            name: {type: String,  required: true, minlength: 5},
            picture: {type: String, default: ''}
        },
        password: {
            type: String,  required: true, minlength: 8
        },
        email: {
            type:String,trim:true,required: true, unique: true, minlength: 8,
            validate: {
                validator: (valu) => {
                    return validator.isEmail(valu);
                },
                message: "invalid mail"
            }
        },
        address:{
            country:String,
            state:String,
            city:String,
            phone:String,
            street:String,
            address:String
        }
        ,
        role:String,// admin,author,default
        history: [
            {
                date: Date,
                paid: {type: Number, default: 0}
            }
        ]


    }
);


userSchema.pre('save', function (next) {
    let user = this;
    let password = user.password;
    let saltRound = 10;

    if (user.isModified('password')) {
        bcrypt.hash(password, saltRound).then(
            function (hash) {
                user.password = hash;
                next();
            },
            function (err) {
                throw new Error(err);
            }
        );
    } else {
        next();
    }


});

userSchema.methods.cheachPasssword = function (password) {
    return bcrypt.compare(password, this.password);
};

userSchema.methods.gravatar = function(){
    if(!this.size) size = 200;
    if(!this.email) return 'https://www.gravatar.com/avatar/?s='+size+'&d=retro';
    let hash =crypto.createHash('md5').update(this.email.toString().trim()).digest("hex");
    return 'https://www.gravatar.com/avatar/'+hash+'/?s='+size+'&d=retro';
}

let user = mongoose.model('user', userSchema);
module.exports.User = user;