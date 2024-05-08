const mongoose = require("mongoose")

// const bcrypt = require("bcrypt")

const jwt = require("jsonwebtoken")

const Users = require("../Model/UserSchema")

const UsersSchema = require("../Model/UserSchema")

const product = require("../Model/ProductSchema")

const {joiproductSchema} = require("../Model/ValidateSchema")

const OrderSchema = require("../Model/OrderSchema")








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
   
    allUser: async (req, res) => {
        const allUser = await UsersSchema.find();
        
    
        if (allUser.length === 0) {
          return res
            .status(404)
            .json({ status: "error", message: "User not found" });
        } else {
          res.status(200).json({
            status: "success",
            message: "successfully fetched user data",
            data: allUser,
    });
 }
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
        const {value,error} = joiproductSchema.validate(req.body);
        console.log(req.body);
        const {title,category,Animal,description,image,price} = value;

        if(error){
            return res.status(400).json({error:error.message});

        }else{
            await product.create({
            
                title,
                category,
                Animal,
                description,
                image,
                price
            });
            res.status(201).json({
                status:"success",
                message:"successfully created product",
                data:product,

            })
        }

    },
    //view all products by category

    allproducts:async(req,res)=>{
        const prods = await product.find()
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
    productById: async (req, res) => {
        const productId = req.params.id;
        const Product = await product.findById(productId);
        if (!Product) {
          return res
            .status(404)
            .send({ status: "error", message: "product not found" });
        } else {
          res.status(200).json({
            status: "sucess",
            message: "successfully fetched",
            data: Product,
        });
        }
    },
     
    
    // },
    //delete product
    deleteProduct: async (req, res) => {
        const { id: productId } = req.params;
        if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
          return res.status(400).json({
            status: "failure",
            message: "invalid product id",
          });
        }
        try {
          const deletedProduct = await product.findOneAndDelete({
            _id: productId,
          });
          if (!deletedProduct) {
            return res
              .status(404)
              .json({
                status: "failure",
                message: "product not found in database",
              });
          }
          return res
            .status(200)
            .json({ status: "success", message: "product deleted successfully" });
        } catch (error) {
          return res
            .status(500)
            .json({
              status: "failure",
              message: "error",
              error_message: error.message,
          });
    }
},
    
    //update product
    updateProduct: async (req, res) => {
        
      try {
          const { value, error } = joiproductSchema.validate(req.body);
      
  
          const {Id,title,category,Animal,description,image,price} = value;
          // console.log(title)
          if (error) {
              return res.status(401).json({ status: 'error', message: error.message });  
          }
  
      
          const updatedProduct = await product.findByIdAndUpdate(
              Id,
              { $set: { title,category,Animal,description,image,price } },
              { new: true } 
          );
          console.log(updatedProduct)
  
          if (updatedProduct) {
              const updatedProducts = await product.findById(Id); 
              return res.status(200).json({
                  status: 'success',
                  message: 'Successfully updated the product.',
                  data: updatedProducts,
              });

              
          } else {
              return res.status(404).json({ status: 'error', message: 'Product not found' });
          }
      } catch (error) {
          console.error('Error updating product:', error);
          return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
  },

    // 
    
    //order details
    AdminorderDetails:async(req,res)=>{
        const products = await OrderSchema.find()
        
        if(products.length===0){
            return res.status(404).json({
                status:"error",
                message:"no order details",
                

            })
        }
        res.status(200).json({
            status:"success",
            message:"order Details Successfully fetched",
            order_Data:products
        })
    },
   //total revenue genarated

    status:async(req,res)=>{
        const totalRevenue = await OrderSchema.aggregate([
            {
                $group:{
                    _id:null,
                    totalProduct:{$sum:{$size:"$products"}},
                    totalRevenue:{$sum:"$total_amount"},
                }
            }
        ])
        if(totalRevenue.length>0){
            res.status(200).json({
                status:"success",
                data:totalRevenue[0]
            })
        }else{
            res.status(200).json({
                status:"success",
                data:{totalProduct:0,
                    totalRevenue:0
                }
            })
        }
    }

    
}







