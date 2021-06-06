const express=require('express');
const bodyParser=require('body-parser');
const authenticate=require('../authenticate');
const multer=require('multer');

var storage=multer.diskStorage({
    destination : (req,file,cb)=>{
        cb(null,'public/images');
    },
    filename : (req,file,cb) => {//file object provides a set of several properties
        cb(null,file.originalname)
    }
});

//to define what type of files are accepted
const imageFileFilter=(req,file,cb) => {
    if(!file.originalname.match(/\.(jpg|jpeg|png|gif)$/) ){
        return cb(new Error('You can only upload image file'));
    }
    else{
        return cb(null,true);
    }
};
const upload=multer({ storage : storage, fileFilter : imageFileFilter });
const uploadRouter=express.Router();
uploadRouter.use(bodyParser.json());

uploadRouter.route('/')
.get(authenticate.verifyUser,authenticate.verifyAdmin, (req,res,next) => {
    res.statusCode=403;//operation not supported
    res.end('GET operation is not supported on /imageUpload');
})
.post(authenticate.verifyUser,authenticate.verifyAdmin, upload.single('imageFile'),
    (req,res) => {
        //file is already uploaded till this point
        res.statusCode=200;
        res.setHeader('Content-Type','application/json');
        res.json(req.file);
    }
)
.put(authenticate.verifyUser,authenticate.verifyAdmin, (req,res,next) => {
    res.statusCode=403;//operation not supported
    res.end('PUT operation is not supported on /imageUpload');
})
.delete(authenticate.verifyUser,authenticate.verifyAdmin, (req,res,next) => {
    res.statusCode=403;//operation not supported
    res.end('DELETE operation is not supported on /imageUpload');
});



module.exports=uploadRouter;