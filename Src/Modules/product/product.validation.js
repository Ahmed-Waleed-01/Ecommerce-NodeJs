import joi from 'joi';
import generalValidationfields from '../../Utils/generalValidationFields.js';

const sizesAndColorsValidation=async(value,helpers)=>{
    value=JSON.parse(value);
    //console.log(value);
    const sizeValidation=joi.object({
        value:joi.array().items(joi.string())
    })  

    const validationResult=await sizeValidation.validate({value});

    if(validationResult.error)
    {
        helpers.message(validationResult.error.details)
    }
    else
    {
        return true;
    }
}

export const addProductValidation= {
    body:joi.object().required().keys({
        name:joi.string().min(3).required(),
        description:joi.string().min(50),
        stock:joi.number().min(1),
        price:joi.number().min(0.05).positive().required(),
        discount:joi.number().min(0).max(99.9),
        categoryId:generalValidationfields.id,
        subcategoryId:generalValidationfields.id,
        brandId:generalValidationfields.id,
        sizes:joi.custom(sizesAndColorsValidation),
        colors:joi.custom(sizesAndColorsValidation),        
    }),

    files:joi.object().required().keys({
        image:joi.array().items(generalValidationfields.file.required()).length(1).required(),
        coverImages:joi.array().items(generalValidationfields.file).max(6),
    })
}