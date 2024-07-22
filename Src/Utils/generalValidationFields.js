import joi from "joi";
import mongoose from "mongoose";

//a helper function that checks if the entered id is valid for mongodb
const checkMongoID_validation = (value, helpers) => {
  const checkID = mongoose.Types.ObjectId.isValid(value);
  //console.log(checkID);
  if (checkID) {
    return value;
  } else {
    return helpers.message("Invalid ID");
  }
};

//general validation fields that may get repeated so we will save them here in order to use them.
const generalValidationfields = {
  email: joi.string().email().required(),
  password: joi.string().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")).required(),
  //age must be a numbe between 12 and 125
  age: joi.number().min(12).max(125).positive(), // does not have required condition
  gender: joi
    .string()
    .valid("Male", "Female", "male", "female", "MALE", "FEMALE"), //not required.
  phone: joi
    .string()
    //.length(11)
    .pattern(/^[0-9]+$/), //not required.

  id: joi.string().custom(checkMongoID_validation), //not required.

  file: joi.object({                            // this is a whole object of validation 
    size: joi.number().positive().required(),
    path: joi.string().required(),
    filename: joi.string().required(),
    destination: joi.string().required(),
    mimetype: joi.string().required(),
    encoding: joi.string().required(),
    originalname: joi.string().required(),
  }).unknown(),
};

export default generalValidationfields;
