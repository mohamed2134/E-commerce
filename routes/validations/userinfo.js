let {User} = require('../../models/Users');


let validation = function(user){
    let errors = [];
    if(user.password.length < 8){
        errors.push("password must be at least 8 digits ");
    }
    if(user.profile.name.length < 5){
        errors.push("name must be at least 5 chars ");
    }
   return User.findOne({email:user.email}).then(
        (user)=>{
            if(user){
               errors.push("email already exist ");
            }

            return errors.length === 0 ?Promise.reject():errors;
        },
        (err)=>{
             return new Error("not exist");
        }
    );
};


module.exports.userValidation = validation;