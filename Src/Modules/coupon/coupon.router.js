import { Router } from "express";
import * as couponController from './controller/coupon.controller.js';
import { roles, userAuthMiddleware } from "../../Middleware/Authentication.js";
const router = Router()




router.get('/', (req ,res)=>{
    res.status(200).json({message:"Coupon Module"})
})

router.post('/add',userAuthMiddleware([roles.admin]),couponController.addCoupon)




export default router