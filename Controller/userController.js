const mongoose = require("mongoose")

const User = require("../Model/UserSchema")

const Product = require("../Model/ProductSchema")

const jwt = require("jsonwebtoken")

const bcrypt = require("bcrypt")


const {joiUserSchema} = require("../Model/ValidateSchema")


mongoose.connect("mongodb://localhost:27017/Backend")

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
        if(!user){
            res.status(404).json({
                status:"failed",
                message:"user not found"
            });
        }
        const {productid} = req.body;
        if(!productid){
            res.status(404).json({
                status:"error",
                message:"product not found"
                
            });
        }
        await User.updateOne({id:userid},{$addToSet:{cart:productid}});
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
        const cartProductid = User.cart;
        if(cartProductid.length===0){
            res.status(200).json({
                status:"success",
                message:"cart is empty",
                data:[]
            
            });
        }
        const cartproduct = await Product.find({id:{$in:{cartProductid}}})

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
        const wishProdid = req.params.id;
        
        if(wishProdid.length===0){
            return res.status(200).json({
                status:"success",
                message:"user wishlist is emapty",
                data:[]
            });
        }

        const wishprods = await Product.find({_id:{$in:{wishProdid}}})
        res.status(200).json({
            status:"success",
            message:"wishlist product is fetched successfully",
            data:wishprods
        });
    },
    //delete wishlist

    delete:async(req,res)=>{
        const userid = req.params.id;
        const {productid} = req.body;
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
    }

    //payment
    // payment:async(res,req)=>{
    //     const userid = req.params.id;
    //     const user= await User.findOne({_id:userid}).populate("cart");
    //     if(!user){
    //         return res.status(404).json({
    //             message:"User not found"
    //         });
    //     }
    //     const cartProducts = user.cart
    //     if(cartProducts.length===0){
    //         return res.status(200).json({
    //             status:"success",
    //             message:"cart is empty",
    //             data:[]
    //         })
    //     }
    //     const lineitems = cartProducts.map((item)=>{
    //         return{
    //             price_data:{
    //                 currency:"inr",
    //                 product_data:{
    //                     name:item.title,
    //                     description:item.description

    //                 },
    //                 unit_amount:Math.round(item.price*100),
    //             },
    //             quantity:1,
    //         };
    //     });
    //     session = await stripe.checkout.sessions.create({
    //         payment_method_types:["card"],
    //         line_items:lineitems,
    //         mode:"payment",
    //         session_url:"",

    //     });
    //     if(!session){
    //         return res.json({
    //             status:"failure",
    //             message:"error occured on session side"
    //         });
    //     }
    //     svalue={
    //         userid,
    //         user,
    //         session,
    //     };
    //     res.status(200).json({
    //         status:"success",
    //         message:"strip paymeny session is created",
    //         url:session.url,

    //     });
    // },
    // success:async(res,req)=>{
    //     const{id,user,session} = svalue;

    //     const userid = user._id;
    //     const cartItem = user.cart;
    //     const orders = await order.create({
    //         userid:id,
    //         product:cartItem.map(
    //             (value)=>new mongoose.Types.ObjectId(value._id)
    //         ),
    //         order_id:session.id,
    //         payment_id:`demo ${Date.now()}`,
    //         total_amount:session.amount_total/100,

            

    //     });
    //     if(!orders){
    //         return res.json({message:"error occured while inputing to orderDb"});
    //     }
    //     const userUpdate = await User.upadateOne(
    //         { _id: userId }, 
    //         { $push: { orders: orderId } },
    //         {$set:{cart:[]}},
    //         {new:true}
    //     );
    //     if(userUpdate){
    //         res.status(200).json({
    //             status:"success",
    //             message:"failed to update user data"
    //         });
    //     }
    
        
        
    // }



}

   