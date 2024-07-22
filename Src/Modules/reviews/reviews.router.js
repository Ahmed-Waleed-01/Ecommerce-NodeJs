import { Router } from "express";
import * as reviewController from './controller/reviews.controller.js'
import { roles, userAuthMiddleware } from "../../Middleware/Authentication.js";
import { validationMiddelware } from "../../Middleware/validationMiddleware.js";
import { addReviewVali, deleteReviewVali, getReviewVali, updateReviewVali } from "./reviews.validation.js";
const router = Router()




router.get('/', (req ,res)=>{
    res.status(200).json({message:"reviews Module"})
})

router.post('/add',validationMiddelware(addReviewVali),userAuthMiddleware([roles.user]),reviewController.addReview)
router.patch('/update/:reviewId',validationMiddelware(updateReviewVali),userAuthMiddleware([roles.user]),reviewController.updateReview)
router.delete('/delete/:reviewId',validationMiddelware(deleteReviewVali),userAuthMiddleware([roles.user]),reviewController.deleteReview)
router.get('/:productId',validationMiddelware(getReviewVali),reviewController.showProductReview)



export default router