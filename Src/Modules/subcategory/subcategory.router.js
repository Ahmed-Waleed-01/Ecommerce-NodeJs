import { Router } from "express";
import *as subcategoryController from "./controller/subcategory.controller.js";
import { fileValidation, uploadFile } from "../../Utils/muler.cloud.js";
import { validationMiddelware } from "../../Middleware/validationMiddleware.js";
import { addSubcategoryValidation, deleteSubcategoryValidation, searchSubcategoryValidation, updateSubcategoryValidation } from "./subcategory.validation.js";
import { roles, userAuthMiddleware } from "../../Middleware/Authentication.js";
const router = Router()



router.post("/add", uploadFile(fileValidation.image).single("image"),userAuthMiddleware([roles.admin]),validationMiddelware(addSubcategoryValidation), subcategoryController.addSubcategory);
router.put("/update/:subcategoryId",uploadFile(fileValidation.image).single("image"),userAuthMiddleware([roles.admin]),validationMiddelware(updateSubcategoryValidation),subcategoryController.updateSubcategory);
router.delete("/delete/:subcategoryId",userAuthMiddleware([roles.admin]),validationMiddelware(deleteSubcategoryValidation),subcategoryController.deleteSubcategory);
router.get("/search",validationMiddelware(searchSubcategoryValidation),subcategoryController.searchSubcategory);
router.get("/showAll",subcategoryController.getAllsubCategories);
router.get("/getCategoryById/:subcategoryId",validationMiddelware(deleteSubcategoryValidation),subcategoryController.getSubcategoryById);


export default router