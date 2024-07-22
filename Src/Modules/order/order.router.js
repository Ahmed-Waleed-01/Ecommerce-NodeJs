import { Router } from "express";
import { roles, userAuthMiddleware } from "../../Middleware/Authentication.js";
import * as orderController from './controller/order.controller.js'
import { validationMiddelware } from "../../Middleware/validationMiddleware.js";
import {createCartOrderValidation } from "./order.validation.js";
import express from 'express';
const router = Router()




router.get('/', (req ,res)=>{
    res.status(200).json({message:"order Module"})
})

router.get('/create-cart-order', userAuthMiddleware([roles.user]),validationMiddelware(createCartOrderValidation),orderController.createOrderFromCart);

router.post('/webhook', express.raw({type: 'application/json'}), orderController.stripeWebhook)




export default router