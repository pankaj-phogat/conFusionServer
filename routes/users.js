var express = require('express');
var passport=require('passport');
var User=require('../models/users');
var router = express.Router();
var authenticate=require('../authenticate');
var config=require('../config');
const cors=require('./cors');


/* GET users listing. */
router.options('*',cors.corsWithOptions,(req,res) => {res.sendStatus(200);});
router.get('/',cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin, function(req, res, next) {
  User.find({})
  .then((users) => {
    res.statusCode=200;
    res.setHeader('Content-Type','application/json');
    res.json(users);
  },err => next(err))
  .catch(err => next(err));
});

//register a user
router.post('/signup',cors.corsWithOptions, (req,res,next) => {
    User.register(new User({ username : req.body.username}),
      req.body.password, (err,user) => {
        if(err){
          res.statusCode=500;
          res.setHeader('Content-Type','application/json');
          res.json({ err : err});
        }
        else{
          if(req.body.firstname)
            user.firstname=req.body.firstname;
          if(req.body.lastname)
            user.lastname=req.body.lastname;
          user.save((err,user) => {
            if(err){
              res.statusCode=500;
              res.setHeader('Content-Type','application/json');
              res.json({err : err});
              return ;
            }
            passport.authenticate('local')(req,res, () => {
              res.statusCode=200;
              res.setHeader('Content-Type','application/json');
              res.json({success : true, status : 'Registration successful!'});
            });
          });
        }
    });
});


//login
router.post('/login',cors.corsWithOptions,(req,res,next) => {
  //runs only if successful
  //successful authentication loads up req.user property into req
  //user id is sufficient for generating token
  //user doesn't exist is not counted as error, that info is passed into info
  passport.authenticate('local',(err,user,info) => {
    if(err) return next(err);
    if(!user){//user doesn't exist
      res.statusCode=401;//Unauthorized
      res.setHeader('Content-Type','application/json');
      res.json({success : false, status : 'Login Unsuccessful!', err : info});
    }
    //req.logIn is available if successful
    req.logIn(user, (err)=>{
      if(err){
        res.statusCode=200;
        res.setHeader('Content-Type','application/json');
        res.json({success : true,status : 'Could not log in user!'});
      }
      var token=authenticate.getToken({ _id : req.user._id});
      res.statusCode=200;
      res.setHeader('Content-Type','application/json');
      res.json({success : true, token : token, status : 'Login successful!'});
    })
  })(req,res,next);
});

router.get('/logout',cors.corsWithOptions,(req,res,next) => {
  if(req.session) {
    //destroy session on serverside
    req.session.destroy();
    res.clearCookie('session-id');//delete cookie on client side
    res.redirect('/');
  }
  else{
    var err=new Error('You are not logged in');
    err.status=403;//forbidden operation
    next(err);
  }
});

router.get('/facebook/token',passport.authenticate('facebook-token'),
(req,res) => {
    if(req.user){//user is already loaded if successful authentication
      var token=authenticate.getToken({_id : req.user._id});
      res.statusCode=200;
      res.setHeader('Content-Type','application/json');
      res.json({success : true,token : token, status : 'You have successfully logged in'});
    }
});

router.get('/checkJWTToken',cors.corsWithOptions,(req,res,next) => {
  passport.authenticate('jwt',{ session : false}, (err,user,info) => {
    if(err) return next(err);
    if(!user){
      res.statusCode=401;
      res.setHeader('Content-Type','application/json');
      return res.json({status : 'JWT invalid!',success : false, err : info});
    }
    else{
      res.statusCode=200;
      res.setHeader('Content-Type','application/json');
      return res.json({status : 'JWT valid!',success : true, user : user});
    }
  })(req,res);
})
module.exports = router;
