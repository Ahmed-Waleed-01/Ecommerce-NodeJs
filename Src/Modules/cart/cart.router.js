import { Router } from "express";
import { roles, userAuthMiddleware } from "../../Middleware/Authentication.js";
import * as cartController from "./controller/cart.controller.js"
import { validationMiddelware } from "../../Middleware/validationMiddleware.js";
import { addToCartValidation } from "./cart.validation.js";
const router = Router()




router.get('/',userAuthMiddleware([roles.user]),cartController.showCart)

router.post('/addToCart',userAuthMiddleware([roles.user]),validationMiddelware(addToCartValidation),cartController.addToCart)



export default router