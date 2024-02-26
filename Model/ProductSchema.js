const mongoose = require("mongoose")

const ProductSchema = new mongoose.Schema({
    title:String,
    catagory:String,
    Animal:String,
    description:String,
    image:String,
    price:Number
    

});
const product = mongoose.model("Product",ProductSchema)

module.exports=product;
