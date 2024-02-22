require("dotenv").config();
const mongoose=require("mongoose");
const express =require("express")
const bodyParser=require('body-parser')
const userRouter=require("./Router/UserRouter")
const adminRouter=require("./Router/AdminRouter")
const app=express()
const port =4008


const mongodb="mongodb://127.0.0.1:27017/Backend";
    //  useNewUrlParser:true,
    //  useUnifiedTopolgy:true,

    main().catch((err)=>{ 
        console.log(err);
    })



    async function main(){
        await mongoose.connect(mongodb)
        console.log("db connected");
    }




app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())

app.use(express.json())

app.use("/api/users",userRouter)
app.use("/api/admin",adminRouter)







app.listen(port,()=>{
    console.log("server is running on port",port);
})