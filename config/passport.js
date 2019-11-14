var mongoose=require('mongoose');
var passport=require('passport');
var LocalStrategy =require('passport-local').Strategy;
var Schema =require('../models/user');
var User=mongoose.model('User',Schema);
var bcrypt =require('bcryptjs');

module.exports=async function(passport){
    await passport.use(new LocalStrategy(function(username,password,done){
            User.findOne({username:username},function(err,user){
                if(err){
                    console.log("error in module.exports in passport.js"+err);
                }
                if(!user){
                    return done(null,false,{message:'No user found'});
                }
                bcrypt.compare(password,user.password,function(err,isMatch){
                        if(err){
                            console.log("error in bcrypt.compare in passport.js"+err);
                        }
                        if(isMatch){
                            return done(null,user);
                        }else{
                            return done(null,false,{message:'Wrong password'});
                            
                        }
                });
            });
    }));
}
passport.serializeUser(function(user,done){
    done(null,user.id);
});

passport.deserializeUser(function(id,done){
    User.findById(id,function(err,user){
        done(err,user);
    });
});