import {Request,Response,NextFunction} from "express";
import {z} from "zod";

export const validate = (schema:z.ZodObject<any>)=>{

    return (req:Request,res:Response,next:NextFunction)=>{

    try{
      schema.parse({
      body:req.body
    })
      next()
    }

    catch(error){
    if(error instanceof z.ZodError){
      return res.status(400).json({
        success:false,
        message:"Validation Error",
        errors:error.issues.map((issue)=>({
          field: issue.path[1],
          message: issue.message
        }))
      })
    }
    next(error)
  }
  }
  
}