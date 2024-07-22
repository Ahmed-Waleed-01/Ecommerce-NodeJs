import slugify from "slugify";
import brandModel from "../../../../DataBase/Models/Brand.Model.js";
import { asyncHandler } from "../../../Utils/ErrorHandling.js";
import cloudinary from "../../../Utils/cloudinary.js";

export const addBrand = asyncHandler(async (req, res, next) => {
  //modifying the brand name to all upper case.
  let { name } = req.body;
  name = name.toUpperCase();

  //seeing if the brand exists or not.
  const brand_exist = await brandModel.findOne({ name });
  if (brand_exist) {
    return next(new Error(`Brand ${name} is used already.`));
  }

  //uploading the brand image or logo to the cloud.
  const uploaded = await cloudinary.uploader.upload(req.file.path, {
    folder: `Ecommerce/Brands`,
  });

  //creating the new brand to the database.
  const brand = await brandModel.create({
    name,
    slug: slugify(name),
    image: { secure_url: uploaded.secure_url, public_id: uploaded.public_id },
    createdBy:req.user._id
  });

  res.status(201).json({ Message: "Brand created successfully.", brand });
});

export const updateBrand = asyncHandler(async (req, res, next) => {
  let name = req.body.name;
  name = name.toUpperCase();
  const slug = slugify(name);
  const image = req.file;
  const { brandId } = req.params;

  //checking if the brand id is correct.
  const brand_exist = await brandModel.findById(brandId);
  if (!brand_exist) {
    return next(new Error("Invalid id."));
  }

  //deep copying the brand values into a new object.
  let updatedBrand = {};
  updatedBrand.name = name;
  updatedBrand.slug = slug;
  updatedBrand.image = brand_exist.image;

  //seeing if the new name is already used in the database or not.
  const matchingNames = await brandModel.findOne({
    name: name,
    _id: { $ne: brandId },
  });
  //if the name was already used then abort.
  if (matchingNames) {
    return next(new Error("Brand name is already used."));
  }

  //if there is a new picture we will delete the old one to replace it with the new one.
  if (image) {
    //deleting the old image.
    const move1 = await cloudinary.uploader.destroy(
      brand_exist.image.public_id
    );

    //uploading the new image.
    const uploaded = await cloudinary.uploader.upload(image.path, {
      folder: `Ecommerce/Brands`,
    });

    //adding the public id and url to the updated category object
    updatedBrand.image.public_id = uploaded.public_id;
    updatedBrand.image.secure_url = uploaded.secure_url;
  }

  const result = await brandModel.findByIdAndUpdate(
    brandId,
    {
      name: updatedBrand.name,
      slug: updatedBrand.slug,
      image: updatedBrand.image,
    },
    { new: true }
  );

  res.status(200).json({
    Message: "Brand updated successfully.",
    result,
  });
});

export const deleteBrand = asyncHandler(async (req, res, next) => {
  const { brandId } = req.params;

  const brand_exist = await brandModel.findByIdAndDelete(brandId);
  if (!brand_exist) {
    return next(new Error("Invalid id."));
  }

  const deleteImg = await cloudinary.uploader.destroy(
    brand_exist.image.public_id
  );

  res.status(200).json({ Message: "Done", brand_exist });
});

export const getAllBrands=asyncHandler(async(req,res,next)=>{
  const result=await brandModel.find();

  res.status(200).json({Brands:result})
})