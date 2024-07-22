import { Router } from "express";
import { fileValidation, uploadFile } from "../../Utils/muler.cloud.js";
import * as productController from "./controller/product.controller.js"
import {validationMiddelware} from "../../Middleware/validationMiddleware.js"
import { addProductValidation } from "./product.validation.js";
import { roles, userAuthMiddleware } from "../../Middleware/Authentication.js";
const router = Router()


router.post('/add',uploadFile(fileValidation.image).fields([{name:"image",maxCount:1},{name:"coverImages",maxCount:6}]),validationMiddelware(addProductValidation),userAuthMiddleware(roles.admin),productController.addProducut)

router.get('/', productController.getProducuts)
router.get('/:productId', productController.getProducutById)



export default router