import Joi from "joi";
import generalValidationfields from "../../Utils/generalValidationFields.js";

export const addSubcategoryValidation = {
  body: Joi.object({
    name: Joi.string().required(),
    categoryId: generalValidationfields.id.required(),
  }).required(),
  file: generalValidationfields.file.required(),
};

export const updateSubcategoryValidation = {
  body: Joi.object({
    name: Joi.string().required(),
    categoryId: generalValidationfields.id,
  }).required(),
  file: generalValidationfields.file,
  params: Joi.object({
    subcategoryId: generalValidationfields.id,
  }),
};

export const deleteSubcategoryValidation = {
  params: Joi.object({
    subcategoryId: generalValidationfields.id.required(),
  }),
};

export const searchSubcategoryValidation = {
  query: Joi.object({
    searchKey: Joi.string().alphanum(),
  }).required(),
};
