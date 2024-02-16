require("dotenv").config()
const express = require("express")
const adminroute = require("./Router/AdminRouter")
const userrouter = require("./Router/UserRouter")


const app = express()

const PORT = 3002;

app.use(express.json())
app.use("/",userrouter)
app.listen(PORT,(err)=>{
    if(err){
        console.log(`error dected by ${err}`);
    }
    console.log(`server running the port ${PORT}`);
})