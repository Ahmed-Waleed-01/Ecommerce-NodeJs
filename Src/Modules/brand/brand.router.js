import { Router } from "express";
import { fileValidation, uploadFile } from "../../Utils/muler.cloud.js";
import { validationMiddelware } from "../../Middleware/validationMiddleware.js";
import * as brandController from "./controller/brand.controller.js"
import { addBrandValidation, deleteBrandValidation, updateBrandValidation } from "./brand.validation.js";
import { roles, userAuthMiddleware } from "../../Middleware/Authentication.js";
const router = Router()


router.post("/add",uploadFile(fileValidation.image).single("image"),userAuthMiddleware(roles.admin),validationMiddelware(addBrandValidation),brandController.addBrand);
router.put("/update/:brandId",uploadFile(fileValidation.image).single("image"),validationMiddelware(updateBrandValidation),brandController.updateBrand)
router.delete("/delete/:brandId",validationMiddelware(deleteBrandValidation),brandController.deleteBrand);
router.get('/getAll',brandController.getAllBrands)


export default router