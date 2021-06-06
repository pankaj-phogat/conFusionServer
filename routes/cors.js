const express=require('express');
const cors=require('cors');
const app=express();

//list is all the origins that the server is willing to accept
const whitelist=['http://localhost:3000','https://localhost:3443', 'http://localhost:3001'];
var corsOptionsDelegate=(req,callback) => {
    var corsOptions;
    console.log(req.header('Origin'));
    if(whitelist.indexOf(req.header('Origin')) != -1){
        corsOptions={ origin : true };
    }
    else{
        corsOptions={ origin : false };
    }
    callback(null,corsOptions);
}

exports.cors=cors();//this means wildcard * allow access to all
exports.corsWithOptions=cors(corsOptionsDelegate);