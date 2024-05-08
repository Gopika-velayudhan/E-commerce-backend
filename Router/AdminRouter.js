const express = require("express")
const router = express.Router()
const admincontroler = require("../Controller/Admincontroller")
const tryCatchMiddleware = require("../Middlewares/trycatch")
const verifyTocken = require("../Middlewares/Adminauth")
const imageUpload = require("../Middlewares/imageupload/imageupload")


router 
 
.post("/login",tryCatchMiddleware(admincontroler.login))

.use(verifyTocken) 

.get("/users",tryCatchMiddleware(admincontroler.allUser))
.get("/users/:id",tryCatchMiddleware(admincontroler.userById))
.post("/products",imageUpload,tryCatchMiddleware(admincontroler.createProduct))
.get("/allproduct", tryCatchMiddleware(admincontroler.allproducts) )
.delete("/deleteproducts/:id",tryCatchMiddleware(admincontroler.deleteProduct))
.get("/productbyid/:id",tryCatchMiddleware(admincontroler.productById))
.put("/update/:id",tryCatchMiddleware(admincontroler.updateProduct))
.get("/orders",tryCatchMiddleware(admincontroler.AdminorderDetails))   
 .get("/status",tryCatchMiddleware(admincontroler.status)) 



module.exports=router

