import Joi from "joi";
import generalValidationfields from "../../Utils/generalValidationFields.js";

export const addToCartValidation ={
    body: Joi.object().required().keys({
        productId:generalValidationfields.id.required(),
        quantity:Joi.number().min(0).required()
    })
}