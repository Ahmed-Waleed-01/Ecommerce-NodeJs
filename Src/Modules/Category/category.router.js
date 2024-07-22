import express from "express";
import { fileValidation, uploadFile } from "../../Utils/muler.cloud.js";
import * as categoryController from "./Controller/category.controller.js"
import { validationMiddelware } from "../../Middleware/validationMiddleware.js";
import { addCategoryValidation, deleteCategoryValidation, searchCategoryValidation, updateCategoryValidation } from "./category.validation.js";
import { roles, userAuthMiddleware } from "../../Middleware/Authentication.js";

export const categoryRouter = express.Router();

categoryRouter.post("/add",uploadFile(fileValidation.image).single("image"),userAuthMiddleware([roles.admin]),validationMiddelware(addCategoryValidation),categoryController.addCategory);
categoryRouter.put("/update/:categoryId",uploadFile(fileValidation.image).single("image"),userAuthMiddleware([roles.admin]),validationMiddelware(updateCategoryValidation),categoryController.updateCategory);
categoryRouter.delete("/delete/:categoryId",validationMiddelware(deleteCategoryValidation),userAuthMiddleware([roles.admin]),categoryController.deleteCategory);
categoryRouter.get("/search",validationMiddelware(searchCategoryValidation),categoryController.searchCategory);
categoryRouter.get("/allCategories", categoryController.getAllCategories);
categoryRouter.get("/getCategoryById/:categoryId",validationMiddelware() ,categoryController.getCategoryById);
