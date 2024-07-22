import { asyncHandler } from "../../../Utils/ErrorHandling.js";
import categoryModel from "../../../../DataBase/Models/Category.Model.js";
import cloudinary from "../../../Utils/cloudinary.js";
import slugify from "slugify";
import { AdvancedSearch } from "../../../Utils/advancedSearch.js";
import subcategoryModel from '../../../../DataBase/Models/SubCategory.Model.js'
import productModel from "../../../../DataBase/Models/Product.Model.js"

//deleting the image folder.
// const result = await cloudinary.api.delete_folder(
//   `Ecommerce/Categories/${category_exist.name}`
// );

// const options = {
//   method: 'POST',
//   body: JSON.stringify(todoObject),
//   headers: { 'Content-Type': 'application/json' }
// }

export const addCategory = asyncHandler(async (req, res, next) => {
  // the user which adds the category is still not added.
  let name = req.body.name;
  name = name.toUpperCase();
  const image = req.file;

  //checking if the name of the category was already used or not
  const name_exists = await categoryModel.findOne({ name });
  if (name_exists) {
    return next(new Error("Category name is already in use."));
  }

  //uploading the category image and slug.
  const slug = slugify(name);
  const uploaded = await cloudinary.uploader.upload(image.path, {
    folder: `Ecommerce/Categories`,
  });
  console.log(req.user);
  //creating the new category.
  const newCategory = await categoryModel.create({
    //don't forget to add the user who added this category.
    name,
    slug: slug,
    image: { secure_url: uploaded.secure_url, public_id: uploaded.public_id },
    createdBy:req.user._id
  });

  res
    .status(201)
    .json({ Message: "Category added successfully.", newCategory });
});

export const updateCategory = asyncHandler(async (req, res, next) => {
  let name = req.body.name;
  name = name.toUpperCase();
  const slug = slugify(name);
  const image = req.file;
  const { categoryId } = req.params;

  //checking if the category id is correct.
  const category_exist = await categoryModel.findById(categoryId);
  if (!category_exist) {
    return next(new Error("Invalid id."));
  }

  //deep copying the category values into a new object.
  let updatedCategory = {};
  updatedCategory.name = name;
  updatedCategory.slug = slug;
  updatedCategory.image = category_exist.image;

  //seeing if the new name is already used in the database or not.
  const matchingNames = await categoryModel.findOne({
    name: name,
    _id: { $ne: categoryId },
  });
  //if the name was already used then abort.
  if (matchingNames) {
    return next(new Error("Category name is already used."));
  }

  //if there is a new picture we will delete the old one to replace it with the new one.
  if (image) {
    //deleting the old image.
    const move1 = await cloudinary.uploader.destroy(
      category_exist.image.public_id
    );

    //uploading the new image.
    const uploaded = await cloudinary.uploader.upload(image.path, {
      folder: `Ecommerce/Categories`,
    });

    //adding the public id and url to the updated category object
    updatedCategory.image.public_id = uploaded.public_id;
    updatedCategory.image.secure_url = uploaded.secure_url;
  }

  const result = await categoryModel.findByIdAndUpdate(
    categoryId,
    {
      name: updatedCategory.name,
      slug: updatedCategory.slug,
      image: updatedCategory.image,
    },
    { new: true }
  );

  res.status(200).json({
    Message: "Category updated successfully.",
    result,
  });
});

export const deleteCategory = asyncHandler(async (req, res, next) => {
  const { categoryId } = req.params;
  
  const category_exist = await categoryModel.findByIdAndDelete(categoryId);
  if (!category_exist) {
    return next(new Error("Invalid category id."));
  }

  const subcategories_under_category= await subcategoryModel.find({categoryId:category_exist._id});
  
  //we are looping on the subcategories which have this category as parent.
  for (let index = 0; index < subcategories_under_category.length; index++) {
    const subcategory = subcategories_under_category[index];
    //making the link which will call the delete subcategory api to delete the subcategory in a clean way.
    const link = `${req.protocol}://${req.headers.host}/subcategory/delete/${subcategory._id}`;
    //we then fetch (call) the api to delete the subcategory and we send request headers to pass user token.
    await fetch(link,{method:'DELETE',headers:req.headers})
  }

  //making the refrence for the products that used to have that category null.
  const products= await productModel.find({categoryId:category_exist._id});
  for (let index = 0; index < products.length; index++) {
    const product = products[index];
    product.categoryId=null;
    product.save();
  }

  const deleteImg = await cloudinary.uploader.destroy(
    category_exist.image.public_id
  );

  res.status(200).json({ Message: "Done", category_exist });
});

export const searchCategory = asyncHandler(async (req, res, next) => {
  const advancedSearch = new AdvancedSearch(categoryModel, req.query);

  const categories = await advancedSearch.getSearchResultAndPopulate(["subcategories"]); //this will return the search results with population
  const categoriesCount = await advancedSearch.getItemsCount();
  const pagesCount = await advancedSearch.getPagesCount(categoriesCount);

  res.status(200).json({ Categories: categories ,categoriesCount,pagesCount});
});

export const getAllCategories = asyncHandler(async (req, res, next) => {
  //using virtual populate to show all of the subcategories of each shown category.
  const searchResult = await categoryModel.find().populate("subcategories");
  res.status(200).json({ Categories: searchResult });
});

export const getCategoryById = asyncHandler(async (req, res, next) => {
  const { categoryId } = req.params;

  //using virtual populate to show all of the subcategories of each shown category.
  const searchResult = await categoryModel
    .findById(categoryId)
    .populate("subcategories");

  if (!searchResult) {
    return next(new Error("Could't find a category with the same id."));
  }

  res.status(200).json({ Categories: searchResult });
});

// export const searchCategory = asyncHandler(async (req, res, next) => {

//   let { searchKey } = req.query;
//   let searchResult = [];

//   //if the search key is empty then return all.
//   if (searchKey == undefined || searchKey == "") {
//     searchResult = await categoryModel.find().populate("subcategories");
//   }
//   //if the search key is not empty them find all matching with the search key
//   else {
//     //changing the searchkeys to all upper case.
//     searchKey = searchKey.toUpperCase();
//     searchResult = await categoryModel.find({
//       name: {
//         $regex: `${searchKey}`,
//       },
//     });
//   }

//   res.status(200).json({ Categories: searchResult});
// });


