import Joi from "joi";
import generalValidationfields from "../../Utils/generalValidationFields.js";

export const addReviewVali={
    body:Joi.object().required().keys({
        comment:Joi.string().min(3).max(500),
        rating:Joi.number().min(1).max(10).required(),
        productId:generalValidationfields.id.required(),
    })
}

export const updateReviewVali={
    body:Joi.object().required().keys({
        comment:Joi.string().min(3).max(500),
        rating:Joi.number().min(1).max(10),
    }),
    params:Joi.object().required().keys({
        reviewId:generalValidationfields.id.required(),
    })
}

export const deleteReviewVali={
    params:Joi.object().required().keys({
        reviewId:generalValidationfields.id.required(),
    })
}

export const getReviewVali={
    params:Joi.object().required().keys({
        productId:generalValidationfields.id.required(),
    })
}