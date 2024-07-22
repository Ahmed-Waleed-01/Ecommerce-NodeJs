import Joi from "joi";
import generalValidationfields from "../../Utils/generalValidationFields.js";

export const createCartOrderValidation ={
    body: Joi.object().required().keys({
        couponCode:Joi.string(),
        address:Joi.string().required(),
        note:Joi.string(),
        paymentMethod:Joi.string(),
        phone:generalValidationfields.phone,
    })
}