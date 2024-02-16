const express = require("express")
const router = express.Router()
const userControler = require("../Controller/userController")
const trycatchmiddleware = require("../Middlewares/trycatch")
const verifyTocken = require("../Middlewares/userauth")

router

.post("/register",trycatchmiddleware(userControler.userRegister))
.post("/userlogin",trycatchmiddleware(userControler.userlogin))
.use(verifyTocken)
.get("/viewProduct",trycatchmiddleware(userControler.viewallproduct))
.get("/products/:id",trycatchmiddleware(userControler.viewgetbyid))
.post("/addCart/:id",trycatchmiddleware(userControler.addtocart))
.get("/viewCart/:id",trycatchmiddleware(userControler.cartview))
.post("/addtowishlist/:id",trycatchmiddleware(userControler.addproducttowishlist))
.get("/showwishlist/:id",trycatchmiddleware(userControler.showwishlist))
.delete("/deletewishlist/:id",trycatchmiddleware(userControler.delete))
// .post("/:id/payment",tryCatchMiddleware(userControler.payment))
// .get("/payment/success",tryCatchMiddleware(userControler.success))

module.exports=router