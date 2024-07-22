import { Router } from "express";
import { fileValidation, uploadFile } from "../../Utils/muler.cloud.js";
import * as userController from "./controller/user.controller.js";
import { validationMiddelware } from "../../Middleware/validationMiddleware.js";
import { signupUserValidation, confirmEmailValidation, signinUserValidation, resetPasswordValidation, updateUserValidation, changePasswordValidation, addToFavoritesValidation } from "./user.validation.js";
import { roles, userAuthMiddleware } from "../../Middleware/Authentication.js";
const router = Router()




router.get('/', (req ,res)=>{
    res.status(200).json({message:"User Module"})
})

router.post('/sign-up/user', uploadFile(fileValidation.image).single("image"),validationMiddelware(signupUserValidation),userController.signUpUser )
router.post('/sign-up/admin',uploadFile(fileValidation.image).single("image"),validationMiddelware(signupUserValidation), userController.signUpAdmin)
router.get('/confrimEmail/:userId/:confirmationCode',validationMiddelware(confirmEmailValidation),userController.confirmEmail )
router.get('/signin',validationMiddelware(signinUserValidation),userController.signin)
router.post('/forgotPassword',userController.forgotPassword)
router.patch('/resetPassword/:token',validationMiddelware(resetPasswordValidation),userController.resetPassword)
router.put('/update/',userAuthMiddleware([roles.admin,roles.user]),uploadFile(fileValidation.image).single("image"),validationMiddelware(updateUserValidation),userController.updateUser)
router.delete('/delete',userAuthMiddleware([roles.admin,roles.user]),userController.deleteUser)
router.patch('/changePassword',validationMiddelware(changePasswordValidation),userAuthMiddleware([roles.admin,roles.user]),userController.changePassword)
router.post('/add-to-favorites',validationMiddelware(addToFavoritesValidation),userAuthMiddleware([roles.user]),userController.addToFavorites)
router.get('/get-favorites',userAuthMiddleware([roles.user]),userController.getFavorites)



router.get('/resetPassword/:token',validationMiddelware(resetPasswordValidation),(req,res,next)=>{
    res.json({Message:"Please take the url and paste in postman and use patch methode to update password."})
})



export default router