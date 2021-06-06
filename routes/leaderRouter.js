const express=require('express');
const bodyParser=require('body-parser');
const authenticate=require('../authenticate');
const leaderRouter=express.Router();
leaderRouter.use(bodyParser.urlencoded({extended:false}));
leaderRouter.use(bodyParser.json());
const cors=require('./cors');

const Leaders=require('../models/leaders');

leaderRouter.route('/')
.options(cors.corsWithOptions,(req,res) => {res.sendStatus(200);})
.get(cors.cors,(req,res,next) => {
    Leaders.find(req.query)
    .then((leaders) => {
        res.statusCode=200;
        res.setHeader('Content-Type','application/json');
        res.json(leaders);
    }, err => next(err))
    .catch(err => next(err));
})
.post(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next) => {
    Leaders.create(req.body)
    .then((leader) => {
        res.statusCode=200;
        res.setHeader('Content-Type','application/json');
        res.json(leader);
    }, err => next(err))
    .catch( err => next(err));
})
.put(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next) => {
    res.statusCode=403;//operation not supported
    res.end('PUT operation is not supported on /promotions');
})
.delete(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next) => {
    Leaders.remove({})
    .then((resp) => {
        res.statusCode=200;
        res.setHeader('Content-Type','application/json');
        res.json(resp);
    },err => next(err))
    .catch(err => next(err));
});



leaderRouter.route('/:leaderId')
.options(cors.corsWithOptions,(req,res) => {res.sendStatus(200);})
.get(cors.cors,(req,res,next) => {
    Leaders.findById(req.params.leaderId)
    .then((leader) => {
        res.statusCode=200;
        res.setHeader('Content-Type','application/json');
        res.json(leader);
    }, err => next(err))
    .catch(err => next(err));
})
.post(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next) => {
    res.statusCode=403;
    res.end('POST operation not supported on /promotions/'+req.params.promoId);
})
.put(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next) => {
    Leaders.findByIdAndUpdate(req.params.leaderId,{ $set : req.body }, { new : true })
    .then((leader) => {
        res.statusCode=200;
        res.setHeader('Content-Type','application/json');
        res.json(leader);
    }, err => next(err))
    .catch(err => next(err));
})
.delete(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next) => {
    Leaders.findByIdAndRemove(req.params.leaderId)
    .then((resp) => {
        res.statusCode=200;
        res.setHeader('Content-Type','application/json');
        res.json(resp);
    },err => next(err))
    .catch(err => next(err));
});


module.exports=leaderRouter;