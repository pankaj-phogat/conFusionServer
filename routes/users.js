var express = require('express');
var passport=require('passport');
var User=require('../models/users');
var router = express.Router();
var authenticate=require('../authenticate');
var config=require('../config');



/* GET users listing. */
router.get('/', function(req, res, next) {
  User.find({})
  .then((users) => {
    res.statusCode=200;
    res.setHeader('Content-Type','application/json');
    res.json(users);
  },err => next(err))
  .catch(err => next(err));

});

//register a user
router.post('/signup', (req,res,next) => {
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
router.post('/login',passport.authenticate('local'),(req,res) => {
  //runs only if successful
  //successful authentication loads up req.user property into req
  //user id is sufficient for generating token

  var token=authenticate.getToken({ _id : req.user._id});
  res.statusCode=200;
  res.setHeader('Content-Type','application/json');
  res.json({success : true, token : token, status : 'You are successfully logged in!'});
});

router.get('/logout',(req,res,next) => {
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
module.exports = router;
