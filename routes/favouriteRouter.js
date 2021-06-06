var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var authenticate=require('../authenticate');
var cors=require('./cors');
var Favourites = require('../models/favourites');


var favouriteRouter = express.Router();
favouriteRouter.use(bodyParser.json());


favouriteRouter.route('/')
.options(cors.corsWithOptions,(req,res) => {res.sendStatus(200);})
.get(cors.cors,authenticate.verifyUser,function(req, res, next) {
  Favourites.find({})
    .populate('user')
    .populate('dishes')
    .then((favourites) => {
        // extract favourites that match the req.user.id
      if (favourites) {
          user_favourites = favourites.filter(fav => fav.user._id.toString() === req.user.id.toString())[0];
          if(!user_favourites) {
              var err = new Error('You have no favourites!');
              err.status = 404;
              return next(err);
          }
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(user_favourites);
      } 
      else {
          var err = new Error('There are no favourites');
          err.status = 404;
          return next(err);
      }
        
    }, (err) => next(err))
    .catch((err) => next(err));

})


.post(cors.corsWithOptions ,authenticate.verifyUser,function(req, res, next) {
  // Set up some readable variables
    Favourites.find({})
    .then(favourites => {
        var user;
        if(favourites)
          user=favourites.filter( fav => fav.user._id.toString() === req.user._id.toString() )[0];
        if(!user)
          user=new Favourites({user : req.user._id});
        for(let i of req.body){
          if(user.dishes.find(dish => {
            return dish._id.toString() === i._id.toString();
          })) continue;
          user.dishes.push(i._id);
        }
        user.save()
        .then((fav) => {
          Favourites.findOne(fav)
          .populate('dishes user')
          .then(fav => {
            res.statusCode = 201;
            res.setHeader("Content-Type", "application/json");
            res.json(fav);
            console.log("Favourites Created");
          })
        }, (err) => next(err))
        .catch((err) => next(err));
    },err => next(err))
    .catch(err => next(err));

})
.delete(cors.corsWithOptions,authenticate.verifyUser, 
  (req,res,next)=>{
    Favourites.find({})
    .then(favourites => {
      var user;
      if(favourites){
        user=favourites.filter(fav => fav.user._id.toString() === req.user._id.toString() )[0];
      }
      if(user){
        user.remove()
        .then(result => {
          res.setStatus=200;
          res.setHeader('Content-Type','application/json');
          res.json(result);
        })
      }
      else{
        err=new Error('No records for user '+req.user._id);
        err.status=403;
        return next(err);
      }
    }, err => next(err))
    .catch(err => next(err));
  }
);

// Delete the individual favorites
favouriteRouter.route('/:dishId')
.options(cors.corsWithOptions,(req,res) => {res.sendStatus(200);})
.get(cors.cors, authenticate.verifyUser,(req,res,next) => {
  Favourites.findOne({user : req.user._id})
  .then((favourites) => {
    if(!favourites){
      res.statusCode=200;
      setHeader('Content-Type','application/json');
      return res.json({ "exists" : false, favourites : favourites});
    }
    else{
      if(favourites.dishes.indexOf(req.params.dishId) < 0){
        res.statusCode=200;
        setHeader('Content-Type','application/json');
        return res.json({ "exists" : false, favourites : favourites});
      }
      else{
        res.statusCode=200;
        setHeader('Content-Type','application/json');
        return res.json({ "exists" : false, favourites : favourites});
      }
    }
  },err => next(err))
  .catch(err => next(err));
})
.post(cors.corsWithOptions,authenticate.verifyUser,
  (req,res,next) => {
    Favourites.find({})
    .then(favourites => {
      var user;
      if(favourites)
        user=favourites.filter(fav => fav.user._id.toString() === req.user._id.toString() )[0];
      if(!user) user=new Favourites({user : req.user._id});
      
      if(!user.dishes.find(dish =>  dish._id.toString()===req.params.dishId.toString() ))
        user.dishes.push(req.params.dishId);
      user.save()
      .then((fav) => {
        Favourites.findOne(fav)
        .populate('dishes user')
        .then(fav => {
          res.statusCode = 201;
          res.setHeader("Content-Type", "application/json");
          res.json(fav);
          console.log("Favourites Created");
        })
      }, (err) => next(err))
      .catch((err) => next(err));
    })
  }
)
.delete(cors.corsWithOptions,authenticate.verifyUser, function(req, res, next) {
  Favourites.findOne({ user : req.user._id }, (err,favourite) => {
    if(err) return next(err);
    var index=favourite.dishes.indexOf(req.params.dishId);
    if(index>=0){
      favourite.dishes.splice(index,1);
      favourite.save()
      .then(favourite => {
        return Favourites.findById(favourite._id).populate('dishes user')
      },err => next(err))
      .then(favourite => {
        console.log('Favourite dish deleted ',favourite);
        res.statusCode=200;
        res.setHeader('Content-Type','application/json');
        res.json(favourite);
      },err => next(err))
      .catch(err => next(err));
    }
    else{
      err=new Error('Dish '+req.params.dishId+' already deleted');
      err.status=404;
      return next(err);
    }
  })
});


module.exports = favouriteRouter;