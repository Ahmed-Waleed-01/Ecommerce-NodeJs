import Joi from "joi";
import generalValidationfields from "../../Utils/generalValidationFields.js";

export const addCategoryValidation = {
  body: Joi.object({
    name: Joi.string().required(),
  }).required(),
  file: generalValidationfields.file.required(),
};

export const updateCategoryValidation = {
  body: Joi.object({
    name: Joi.string().required(),
  }).required(),
  file: generalValidationfields.file,
  params: Joi.object({
    categoryId:generalValidationfields.id
  }),
};

export const deleteCategoryValidation = {
  params: Joi.object({
    categoryId: generalValidationfields.id.required(),
  }),
};

export const searchCategoryValidation = {
  query: Joi.object({
    searchKey:Joi.string().alphanum().allow(''),
  }),
};

export const getCategoryByIdValidation = {
  params: Joi.object({
    categoryId: generalValidationfields.id,
  }),
};