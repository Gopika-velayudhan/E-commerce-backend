const trycatchmidddleware = (trycatchhandler)=>{
    return async (req,res,next)=>{
        try{
            await trycatchhandler(req,res,next)
        }catch(error){
            console.log(error)
            res.status(500)
            res.json({
                status:"failure",
                message:"error",
                error_message:error.message
            })

        }
    }
}
module.exports=trycatchmidddleware