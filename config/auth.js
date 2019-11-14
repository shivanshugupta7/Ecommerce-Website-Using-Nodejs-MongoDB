exports.isUser =function(req,res,next){
    if(req.isAuthenticated()){
        next();
    }else{
        req.flash('danger','Please Log in');
        res.redirect('/users/login');
    }
}

exports.isAdmin =function(req,res,next){
    if(req.isAuthenticated() && res.locals.user.admin==1 ){
        next();
    }else{
        req.flash('danger','Please Log in as admin');
        res.redirect('/users/login');
    }
}