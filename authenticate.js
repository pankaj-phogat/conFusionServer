//this file will be used to store 
//authentication strategies

var passport=require('passport'); 
var LocalStrategy=require('passport-local').Strategy;
var User=require('./models/users');
var JwtStrategy=require('passport-jwt').Strategy;
var ExtractJwt=require('passport-jwt').ExtractJwt;
var jwt=require('jsonwebtoken');

var config=require('./config');


exports.local=passport.use(new LocalStrategy(User.authenticate()));// if not using
//passport mongoose then you need to write your own function

//we are still using express session to track the user
//so we need to serialize and deserialize the user
//required for support of session
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


exports.getToken=function(user){
    return jwt.sign(user,config.secretKey,
        {expiresIn : 3600 } );//generate a token
};


var opts={};//options
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;

exports.jwtPassport=passport.use(new JwtStrategy(opts, 
    (jwt_payload,done) => {
        console.log('JWT-payload : ',jwt_payload);
        User.findOne({ _id : jwt_payload._id },(err,user) => {
            if(err){
                return done(err,false);// a passport callback fxn
            }
            else if(user){
                return done(null,user);
            }
            else{
                return done(null,false);
            }
        });
    })
);

exports.verifyUser=passport.authenticate('jwt',{ session : false});