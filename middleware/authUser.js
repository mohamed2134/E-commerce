let checkDefaultUser =  (req, res, next) =>{
    if (!req.user) {
        return res.redirect('/login');
        // return next('router');
    }
    next();
};


let checkAdminUser =  (req, res, next) =>{
    if (req.user && req.user.role === 'admin') {
      return   next();
    }
    return res.redirect('/');
};

module.exports = {
    checkAdminUser,
    checkDefaultUser
};