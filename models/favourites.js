var mongoose=require('mongoose');
var Schema=mongoose.Schema;
require('mongoose-currency').loadType(mongoose);

var dishSchema=new Schema({
    dish : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Dish"
    }
})
var favouriteSchema=new Schema({
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    },
    dishes : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "Dish"
    }]
});

module.exports=new mongoose.model('Favourite',favouriteSchema);