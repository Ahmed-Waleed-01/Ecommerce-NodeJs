import { asyncHandler } from "../../../Utils/ErrorHandling.js";
import categoryModel from "../../../../DataBase/Models/Category.Model.js";
import cloudinary from "../../../Utils/cloudinary.js";
import slugify from "slugify";
import subcategoryModel from "../../../../DataBase/Models/SubCategory.Model.js";
import { AdvancedSearch } from "../../../Utils/advancedSearch.js";

export const addSubcategory = asyncHandler(async (req, res, next) => {
  // the user which adds the category is still not added.
  let name = req.body.name;
  let categoryId = req.body.categoryId;
  name = name.toUpperCase();
  const image = req.file;

  //checking if the id of the category exists or not.
  const id_exists = await categoryModel.findById(categoryId);
  if (!id_exists) {
    return next(new Error("Category id is invalid."));
  }

  //checking if the name of the category was already used or not
  const name_exists = await subcategoryModel.findOne({ name });
  if (name_exists) {
    return next(new Error("Subcategory name is already in use."));
  }

  //uploading the category image and slug.
  const slug = slugify(name);
  const uploaded = await cloudinary.uploader.upload(image.path, {
    folder: `Ecommerce/subcategories`,
  });

  //creating the new category.
  const newSubcategory = await subcategoryModel.create({
    //don't forget to add the user who added this category.
    name,
    slug: slug,
    image: { secure_url: uploaded.secure_url, public_id: uploaded.public_id },
    categoryId: categoryId,
    createdBy: req.user._id,
  });

  res
    .status(201)
    .json({ Message: "subcategory added successfully.", newSubcategory });
});

export const updateSubcategory = asyncHandler(async (req, res, next) => {
  let name = req.body.name;
  name = name.toUpperCase();
  let categoryId = req.body.categoryId;
  const slug = slugify(name);
  const image = req.file;
  const { subcategoryId } = req.params;

  //checking if the subcategory id is correct.
  const subcategory_exist = await subcategoryModel.findById(subcategoryId);
  if (!subcategory_exist) {
    return next(new Error("Invalid id."));
  }

  //checking if the category id is correct.
  const parentCategory_exist = await categoryModel.findById(categoryId);
  if (!parentCategory_exist) {
    return next(new Error("Invalid id for the parent category."));
  }

  //deep copying the category values into a new object.
  let updatedSubcategory = {};
  updatedSubcategory.name = name;
  updatedSubcategory.slug = slug;
  updatedSubcategory.image = subcategory_exist.image;
  updatedSubcategory.categoryId = categoryId;

  //seeing if the new name is already used in the database or not.
  const matchingNames = await subcategoryModel.findOne({
    name: name,
    _id: { $ne: subcategoryId },
  });

  //if the name was already used then abort.
  if (matchingNames) {
    return next(new Error("Category name is already used."));
  }

  //if there is a new picture we will delete the old one to replace it with the new one.
  if (image) {
    //deleting the old image.
    const move1 = await cloudinary.uploader.destroy(
      subcategory_exist.image.public_id
    );

    //uploading the new image.
    const uploaded = await cloudinary.uploader.upload(image.path, {
      folder: `Ecommerce/subCategories`,
    });

    //adding the public id and url to the updated category object
    updatedSubcategory.image.public_id = uploaded.public_id;
    updatedSubcategory.image.secure_url = uploaded.secure_url;
  }

  const result = await subcategoryModel.findByIdAndUpdate(
    subcategoryId,
    {
      name: updatedSubcategory.name,
      slug: updatedSubcategory.slug,
      image: updatedSubcategory.image,
      categoryId,
    },
    { new: true }
  );

  res.status(200).json({
    Message: "Category updated successfully.",
    result,
  });
});

export const deleteSubcategory = asyncHandler(async (req, res, next) => {
  const { subcategoryId } = req.params;

  const subcategory_exist = await subcategoryModel.findByIdAndDelete(
    subcategoryId
  );
  if (!subcategory_exist) {
    return next(new Error("Invalid subcategory id."));
  }

  //making the refrence for the products that used to have that category null.
  const products = await productModel.find({ subcategoryId: subcategory_exist._id });
  for (let index = 0; index < products.length; index++) {
    const product = products[index];
    product.subcategoryId = null;
    product.save();
  }

  const deleteImg = await cloudinary.uploader.destroy(
    subcategory_exist.image.public_id
  );

  res.status(200).json({ Message: "Subcategory deleted successfully." });
});

export const searchSubcategory = asyncHandler(async (req, res, next) => {
  const advancedSearch = new AdvancedSearch(subcategoryModel, req.query);

  const subcategories = await advancedSearch
    .getSearchResult()
    .populate("categoryId"); //this will return the search results with population
  const subcategoriesCount = await advancedSearch.getItemsCount();
  const pagesCount = advancedSearch.getPagesCount(subcategoriesCount);

  res
    .status(200)
    .json({ Subcategories: subcategories, subcategoriesCount, pagesCount });
});

export const getAllsubCategories = asyncHandler(async (req, res, next) => {
  const searchResult = await subcategoryModel.find();
  res.status(200).json({ Subcategories: searchResult });
});

export const getSubcategoryById = asyncHandler(async (req, res, next) => {
  const { subcategoryId } = req.params;

  const searchResult = await subcategoryModel.findById(subcategoryId);

  if (!searchResult) {
    return next(new Error("Could't find a category with the same id."));
  }

  res.status(200).json({ Categories: searchResult });
});

// export const searchSubcategory = asyncHandler(async (req, res, next) => {

//   let { searchKey } = req.query;
//   let searchResult = [];

//   //if the search key is empty then return all.
//   if (searchKey == undefined || searchKey == "") {
//     searchResult = await subcategoryModel.find();
//   }
//   //if the search key is not empty them find all matching with the search key
//   else {

//     //changing the searchkeys to all upper case.
//     searchKey = searchKey.toUpperCase();
//     searchResult = await subcategoryModel.find({
//       name: {
//         $regex: `${searchKey}`,
//       },
//     });
//   }

//   res.status(200).json({ Subcategories: searchResult });
// });
