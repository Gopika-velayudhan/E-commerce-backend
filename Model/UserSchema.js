const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    name:String,
    email:String,
    phonenumber:Number,
    userName:String,
    password:String,
    cart:[{type:mongoose.Schema.ObjectId,ref:"Product"}],
    wishlist:[{type:mongoose.Schema.ObjectId,ref:"Product"}]

})

module.exports=mongoose.model("user",userSchema)