import couponModel from "../../../../DataBase/Models/Coupon.Model.js";
import { asyncHandler } from "../../../Utils/ErrorHandling.js";
import ErrorClass from "../../../Utils/errorClass.js";

export const addCoupon= asyncHandler(async(req,res,next)=>{
     const {code,expireDate,discount,noOfUses}= req.body;
     
     const code_exist= await couponModel.findOne({code})
     if(code_exist)
     {
        return next(new ErrorClass(`A coupon has already used the Code: ${code} .`))
     }

     const coupon= await couponModel.create({
        code,
        expireDate,
        noOfUses,
        discount,
        createdBy:req.user._id
     })

     res.status(201).json({Message:"Coupon has been created successfully",coupon});
})