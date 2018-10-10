let logID = (req,res,next)=>{
    console.log(req.session.id);
    req.session.id = "123456789";
    next();
};


let generateIDs = function(req,res,next){

    if(!req.session.active){
        req.session.active =  Date.now();
        console.log("inial the session inteval");
       return next();
    }
    console.log("time from it is active",req.session.active);

    let activeTime = Date.now() - req.session.active;
    console.log("active time :",activeTime);
    if(activeTime > 10000){
        console.log("old session ID : ",req.session.id);
        req.session.regenerate(function(err) {
            console.log("new  session ID : ",req.session.id);
            req.session.active =  Date.now();
            if(err)
                return next(err);
            return next();
        });
    }else {
        return next();
    }
    }

let generateID  = function(req,res,next){
    req.session.regenerate(function(err) {
       if(err)
           return next(err);
       return next();
    });
} ;
module.exports = {
    generateID
};


