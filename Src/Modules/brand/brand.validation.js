
import Joi from "joi"
import generalValidationfields from "../../Utils/generalValidationFields.js"

export const addBrandValidation={
    body:Joi.object({
        name:Joi.string().alphanum().required(),
    }).required(),
    file:generalValidationfields.file.required()
}

export const updateBrandValidation = {
  body: Joi.object({
    name: Joi.string().alphanum(),
  }).required(),
  file: generalValidationfields.file,
  params: Joi.object({
    brandId: generalValidationfields.id.required(),
  }).required(),
};

export const deleteBrandValidation = {
  params: Joi.object({
    brandId: generalValidationfields.id.required(),
  }).required(),
};