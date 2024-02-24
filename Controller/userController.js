const mongoose = require("mongoose")

const User = require("../Model/UserSchema")

const Product = require("../Model/ProductSchema")

const jwt = require("jsonwebtoken")

const bcrypt = require("bcrypt")
 const order = require("../Model/OrderSchema")

 const {default:Stripe} = require('stripe')

 const stripe = require("stripe")(process.env.stripe_key)

const {joiUserSchema} = require("../Model/ValidateSchema")

let sValue = {}

module.exports = {
    //user registation(Post)
    userRegister:async(req,res)=>{
        const {value,error} = joiUserSchema.validate(req.body)
        const {name,email,phonenumber,userName,password} = value;
        // console.log(name);
        const hashedPassword = await bcrypt.hash(password,10)

        if(error){
            res.status(400).json({
                status:"error",
                message:"invalid user,please check data"
            });
        }
        const existingUser = await User.findOne({ name: name });

        if (existingUser) {
            return res.status(400).json({
                status: "error",
                message: "User with this name already exists"
            });
        }

        await User.create({
            name:name,
            email:email,
            phonenumber:phonenumber,
            userName:userName,
            password:hashedPassword
        });

        res.status(201).json({
            status:"status",
            message:"user registration successfull"
            
  });
 
  
  
    
    },

    //user login (Post)

    userlogin:async(req,res)=>{
        // console.log(res.body);
        const  { value, error } = joiUserSchema.validate(req.body)
    if(error){
        res.json(error.message);
    }

    const {userName,password} = value;
    console.log(userName,password);

    // console.log(userName,password);
    const user = await User.findOne({
        userName:userName
    });
    console.log(user)
   
    

    if(!user){
         res.status(404).json({
            status:"error",
            message:"user not found"
        });
    }

    if(!password || !user.password){
        return res.status(404).json({
            status:"error",message:"invalid input"
        });
    }


    const passwordMatch = await bcrypt.compare(password,user.password);
    if(!passwordMatch){
        return res.status(401).json({
            error:"error",
            message:"incorrect password"
        });
    }


    const token = jwt.sign(
        {username:user.userName},
        process.env.USER_ACCESS_TOKEN_SECRT,
        {
            expiresIn:86400,
        }
    );

    res.status(200).json({
        status:"success",
        message:"Login successful",
        Token:token
    })
},
    //view all product(get)

    viewallproduct:async(req,res)=>{
        const allproducts =await Product.find()
        if(!allproducts){
            res.status(404).json({
                status:"error",
                message:"the product  not found"
            })
        }
        res.status(200).json({
            status:"Success",
            message:"successfully fetched data",
            data:allproducts
        })
        
    },
    //fetched specific data by using specific id(get:id)

    viewgetbyid:async(req,res)=>{
        const productid = req.params.id;
        const product = await Product.findById(productid)

        if(!product){
            res.status(404).json({
                status:"error",
                message:"product not found"
            });
        
        }
        res.status(200).json({
            status:'success',
            message:"product fetched successfully",
            data:product
        })
    },

    //add to cart
    addtocart:async(req,res)=>{
        const userid = req.params.id;
        const user = await User.findById(userid)
        console.log(userid);
        if(!user){
           return res.status(404).json({
                status:"failed",
                message:"user not found"
            });
        }
        const {productid} = req.body;
        console.log(req.body);
        if(!productid){
            return res.status(404).json({
                status:"error",
                message:"product not found"
                
            });
        }
        await User.updateOne({_id:userid},{$addToSet:{cart:productid}},{new:true});
        res.status(200).send({
            status:"success",
            message:"successfully product was added to cart",
            
        });
    



    },
    //view the product in cart
    cartview:async(req,res)=>{
        const userid = req.params.id
        const user = await User.findById(userid)
        if(!user){
            res.status(404).json({
                status:"error",
                message:"user not found"
            });
        }
        const cartProductid = user.cart;
        if(cartProductid.length===0){
            res.status(200).json({
                status:"success",
                message:"cart is empty",
                data:[]
            
            });
        }
        const cartproduct = await Product.find({ _id: { $in: cartProductid } })

        res.status(200).json({
            status:"success",
            message :"successfully fetched product",
            data:cartproduct

        });
        
    },
    //add product to wish list

    addproducttowishlist:async(req,res)=>{
        const userid = req.params.id;
        
        if(!userid){
            res.status(404).json({
                status:"error",
                message:"user not found"
            });

        }
        const {productid} = req.body;
        const user = await User.findById(userid)
        if(!user){
            res.status(404).json({
                status:"failure",
                message:"product not found"
            })
        }
        const findprod = await User.findOne({_id:userid,wishlist:productid})

        if(findprod){
            return res.status(404).json({
                status:"failure",
                message:"this product already in wishlist"
            });
        }
        const updateResult = await User.updateOne({_id:userid},{$push:{wishlist:productid}});
        res.status(201).json({
            status:"success",
            message:"successfully added product in wishlist",
            data:updateResult
        });

        

        
        


    },
    //showwish list

    showwishlist:async(req,res)=>{
        const userid = req.params.id;
        const user = await User.findById(userid)
        if(!user){
            res.status(404).json({
                status:"error",
                message:"user not found"
            });
        }
        const wishProdid = user.wishlist;
        
        if(wishProdid.length===0){
            return res.status(200).json({
                status:"success",
                message:"user wishlist is emapty",
                data:[]
            });
        }

        const wishprods = await Product.find({ _id: { $in: wishProdid } })
        res.status(200).json({
            status:"success",
            message:"wishlist product is fetched successfully",
            data:wishprods
        });
    },
    //delete wishlist

    delete:async(req,res)=>{

        const userid = req.params.id;
        
        console.log(userid,"ffffff");

        const { productid } = req.body;

        console.log(productid,"dddddd");

        if(!productid){

            return res.status(400).json({
                message:"product not found"
            });
        }
        const user = await User.findById(userid);
        if(!user){
            return res.status(404).json({
                message:"user not found"
            })
        }
        await User.updateOne({_id:userid},{$pull:{wishlist:productid}});

        res.status(200).json({message:"successfully removed from wishlist"})
    },

    // payment
    payment:async(req,res)=>{
        const userid = req.params.id
        
        const user= await User.findOne({_id:userid}).populate("cart");
        console.log(user,"hhhhhhh");
        
        if(!user){
            return res.status(404).json({
                message:"User not found"
            });
        }
        const cartProducts = user.cart
        if(cartProducts.length===0){
            return res.status(200).json({
                status:"success",
                message:"cart is empty",
                data:[]
            })
        }
        const lineitems = cartProducts.map((item)=>{
            return{
                price_data:{
                    currency:"inr",
                    product_data:{
                       
                        name:item.title,
                        description:item.description,
                        
                        

                    },
                    unit_amount:Math.round(item.price*100),
                },
                quantity:1,
            };
        });
        session = await stripe.checkout.sessions.create({
            payment_method_types:["card"],
            line_items:lineitems,
            mode:"payment",
            success_url:"http://localhost:4008/api/users/payment/success",

        });
        if(!session){
        return res.json({
                status:"failure",
                message:"error occured on session side"
            });
        }
        sValue={
            userid,
            user,
            session,
        };
        res.status(200).json({
            status:"success",
            message:"strip paymeny session is created",
            url:session.url,

        });
    },
    
   
//     success: async (req, res) => {
//         const { _id, user, session } = sValue;
    
//         const userId = user._id;
//         const cartItems = user.cart;
    
//         const orders = await order.create({
//           userId: _id,
//           products: cartItems.map(
//             (value) => new mongoose.Types.objectId(value._id)
//           ),
//           order_id: session.id,
//           payment_id:` demo ${Date.now()}`,
//           total_amount: session.amount_total / 100,
//         });
//         console.log("orderr", orders);
    
//         if (!orders) {
//           return res.json({ message: "error occured while inputing to orderDB" });
//         }
    
//         const userUpdate = await User.updateOne(
//           { _id: userId },
//           { $push: { orders: order_id }, $set: { cart: [] } },
//           { new: true }
//         );
    
//         if (userUpdate) {
//           res.status(200).json({
//             status: "success",
//             message: "failed to update user data",
//         });
//     }
// },
    

}

   