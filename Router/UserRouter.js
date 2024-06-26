const express = require("express")
const router = express.Router()
const userControler = require("../Controller/userController")
const trycatchmiddleware = require("../Middlewares/trycatch")
const verifyTocken = require("../Middlewares/userauth")

router

.post("/register",trycatchmiddleware(userControler.userRegister))
.post("/userlogin",trycatchmiddleware(userControler.userLogin))
.use(verifyTocken)
.get("/viewProduct",trycatchmiddleware(userControler.viewallproduct))
.get("/products/:id",trycatchmiddleware(userControler.viewgetbyid))
.post("/addCart/:id",trycatchmiddleware(userControler.addToCart))
.put("/removecart/:id",trycatchmiddleware(userControler.removecartProduct))
.get("/viewCart/:id",trycatchmiddleware(userControler.cartview))
.put("/:id/cart",trycatchmiddleware(userControler.updatecartitemQuantity))
.delete("/:id/cart/:itemid",trycatchmiddleware(userControler.removecartProduct))
.post("/addtowishlist/:id",trycatchmiddleware(userControler.addproducttowishlist))
.get("/showwishlist/:id",trycatchmiddleware(userControler.showwishlist))
.delete("/deletewishlist/:id",trycatchmiddleware(userControler.delete))
.post("/:id/payment",trycatchmiddleware(userControler.payment))
 .post("/paymentsuccess",trycatchmiddleware(userControler.success))
 .get("/order/:id",trycatchmiddleware(userControler.orderDetails))

module.exports=router