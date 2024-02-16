const mongoose = require("mongoose")

const bcrypt = require("bcrypt")

const jwt = require("jsonwebtoken")

const Users = require("../Model/UserSchema")

const UsersSchema = require("../Model/UserSchema")

const Product = require("../Model/ProductSchema")

const joiProductValidate = require("../Model/ValidateSchema")


mongoose.connect("mongodb://localhost:27017//Backend")


module.exports={
    login:async(req,res)=>{
        const {email,password} = req.body;
        if(
            email === process.env.ADMIN_EMAIL && 
            password === process.env.ADMIN_PASSWORD

        ){
            const token = jwt.sign(
                {email:email},
                process.env.ADMIN_ACCESS_TOKEN_SECRT
                

            );
            return res.status(200).send({
                status:"success",
                message:"Admin registration successful",
                data : token

            });
        }else{
            return res.status(404).json({
                status:"error",
                message:"this is not a admin"
            });
        }
    },
    //to find all user
    alluser:async(req,res)=>{
        const alluser = await  UsersSchema.find();

        if(alluser.length===0){
            return res.status(404).json({
                status:"error",
                message:"User not found"
            })
        }
        res.status(200).json({
            status:"successfully",
            message:"sucessfully fetched user data",
            data:alluser,
        })

    },
    //specific user

    userById: async(req,res)=>{
        const userId = req.params.id;
        const user = await Users.findById(userId);

        if(!user){
            return res.status(404).json({
                status:"error",
                message:"Users not foound"
            });
        }
        res.status(200).send({
            status:"success",
            message:"success find user",
            data:user,
        });
    },
    //to create product

    createProduct:async(req,res)=>{
        const {value,error} = joiProductValidate.validate(req.body);

        const {id,title,category,Animal,details,image,price} = value;

        if(error){
            return res.status(400).json({error:error.details[0].message});

        }else{
            await Product.create({
                id,
                title,
                category,
                Animal,
                details,
                image,
                price
            });
            res.status(201).json({
                status:"success",
                message:"successfully created product",
                data:Product,

            })
        }

    },
    //view all products by category

    allproducts:async(req,res)=>{
        const prods = await Product.find()
        if(!prods){
            return(
                res.status(404).send({
                    status:"error",
                    message:'products not found',
                })
            );
        }
        res.status(200).json({
            status:"sucess",
            message:"successfully fetched the product details",
            data:prods
        })

    },
    //to get product by id
    productbyid:async(req,res)=>{
        const productId = req.params.id;
        const product = await Product.findById(productId)
        if(!product){
            return res.status(404).send({
                status:"error",
                message:"product not found"
            });
        }
        res.status(200).json({
            status:"success",
            message:"successfully fetched product details",
            data:product
        });
    },
    //delete product
    deleteproduct:async(req,res)=>{
        const {productId}= req.body;
        if(!productId||mongoose.Types.ObjectId.isValid(productId)){
            return res.status(400).json({
                status:"failure",
                message:"invalid product id provide"
            });
        }
            const deletedproduct = await Product.findOneAndDelete({_id:productId});

            if(!deletedproduct){
                res.status(404).json({
                    status:"failure",
                    message:"product not found in the database"
                });
            }
            return res.status(200).json({
                status:"success",
                message:"deleted successfully"
            })
        
    },
    //update product

    updateProduct:async(req,res)=>{
        const {value,error} = joiProductValidate.validate(req.body);
        if(error){
            return res.status(200).json({
            
                message:error.details[0].message
            })
        }
        const{id,title,category,Animal,details,image,price} = value;
        const product = await Product.find();

        if(!product){
            return res.status(404).json({
                status:"failure",
                message:"product not found in databasse"

            })
        }
        await Product.findByIdAndUpdate({_id:id},{title,category,Animal,details,image,price});
        res.status(200).json({
            status:"sucess",
            message:"product updated successfully"
        });
        

        
    }

    
}







