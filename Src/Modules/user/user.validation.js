import Joi from "joi";
import generalValidationfields from "../../Utils/generalValidationFields.js";

export const signupUserValidation = {
  body: Joi.object()
    .required()
    .keys({
      name: Joi.string().min(3).required(),
      email: generalValidationfields.email,
      password: generalValidationfields.password,
      age: generalValidationfields.age,
      gender: generalValidationfields.gender.required(),
      phone: generalValidationfields.phone,
    }),
  file: generalValidationfields.file,
};

export const confirmEmailValidation = {
  params: Joi.object().required().keys({
    userId: generalValidationfields.id,
    confirmationCode: Joi.string().required(),
  }),
};

export const signinUserValidation = {
  body: Joi.object().required().keys({
    email: generalValidationfields.email,
    password: generalValidationfields.password,
  }),
};

export const resetPasswordValidation = {
  body: Joi.object().required().keys({
    newPassword: generalValidationfields.password,
    cPassword: generalValidationfields.password,
  }),
};

export const updateUserValidation = {
  body: Joi.object()
    .required()
    .keys({
      name: Joi.string().min(3),
      email: Joi.string().email(),
      age: generalValidationfields.age,
      phone: generalValidationfields.phone,
    }),
  file: generalValidationfields.file,
};

export const changePasswordValidation = {
  body: Joi.object().required().keys({
    newPassword: generalValidationfields.password,
    cPassword: generalValidationfields.password,
    oldPassword: generalValidationfields.password,
  }),
};

export const addToFavoritesValidation = {
  body: Joi.object().required().keys({
    productId: generalValidationfields.id.required(),
  }),
};
