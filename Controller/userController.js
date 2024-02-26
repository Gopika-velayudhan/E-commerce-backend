

const User = require("../Model/UserSchema")

const Product = require("../Model/ProductSchema")

const jwt = require("jsonwebtoken")

const bcrypt = require("bcrypt")
 const order = require("../Model/OrderSchema")
 const Order = require("../Model/OrderSchema")

 const {default:Stripe} = require('stripe')

 const stripe = require("stripe")(process.env.stripe_key)
 const products = require("../Model/ProductSchema")

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

    const {email,password} = value;
    console.log(userName,password);

    // console.log(userName,password);
    const user = await User.findOne({
        email:email,
    });
    console.log(user)
    const id = user._id
    const userName = user.userName
   
    

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
        {email:user.email},
        process.env.USER_ACCESS_TOKEN_SECRT,
        {
            expiresIn:86400,
        }
    );

    res.status(200).json({
        status:"success",
        message:"Login successful",
        Token:{token,user}
    })
},
    //view all product(get)

    viewallproduct:async(req,res)=>{
        try{
            const product = await userService.viewallproduct();
            res.status(200).send({
                status:"success",
                message:"successfully fetched data",
                data:product,
            });
        }catch(error){
            res.status(500).send({
                status:"error",
                message:"internal server error",
            });
        }
       
        
        
    },
    //fetched specific data by using specific id(get:id)

    viewgetbyid:async(req,res)=>{
        // const productid = req.params.id;
        // const product = await Product.findById(productid)
        const product = await userService.viewgetbyid(req.params.id)
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
            return res.status(400).json({
                status:"error",
                message:"product id is required in the request body"
                
            });
        }

        const product = await Product.findById(productid)
        if(!product){
            return res.status(404).json({
                status:"failed",
                message:"product not found"
            });
        }
        const isProductinCart = user.cart.some(item=>item.productid.equals(productid));
        if(!isProductinCart){
            return res.status(400).json({
                status:'failed',
                message:"this product already in the cart"
            })
        }
        await User.updateOne({_id:userid},{$addToSet:{cart:productid}},{new:true});
        res.status(200).send({
            status:"success",
            message:"successfully product was added to cart",
            
        });

        
    



    },
   
    
   
    //updatecartitemquantity
    updatecartitemQuantity:async(req,res)=>{
        const userid = req.params.id;
        const {id,quantityChange} = req.body;
        const user = await User.findById(userid)
        if(!user){
            return res.status(404).json({
                message:"user not found"
        })
        }
        const cartItem = user.cart.id(id);
        if(!cartItem){
            return res.status(404).json({
                message:"cart item not found "
            })
        }
        cartItem.quantity += quantityChange;
        if(cartItem.quantity>0){
            await user.save();
        }
        res.status(200).json({
            status:"success",
            message:"cart item quentity updated",
            data:user.cart
        })


    },
    removecartProduct:async(req,res)=>{
        const userid = req.params.id
        const itemid = req.params.itemid
        if(!itemid){
            return res.status(404).json({
                message:"product not found"
            })
        }
        const user = await User.findById(userid)
        if(!user){
            res.status(404).json({message:"user not found"})
        }
        const result = await user.updateOne(
            {_id:userid},
            {$pull:{cart:{productid:itemid}}}
        );
        if(result.modifiedCount>0){
            res.status(200).json({
                message:"product removed successfully",
                data:result
            })
        }
    },
    //cart view
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
            success_url:`http://https://www.youtube.com/watch?v=1r-F3FIONl8&t=267s`,

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

    Success : async(req,res)=>{

    }
    
}