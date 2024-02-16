const mongoose = require("mongoose")

const ProductSchema = new mongoose.Schema({
    id:String,
    title:String,
    catagory:String,
    Animal:String,
    details:String,
    image:String,
    price:Number
    

});
const product = mongoose.model("Product",ProductSchema)

module.exports=product;
