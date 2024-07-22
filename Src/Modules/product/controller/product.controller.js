import slugify from "slugify";
import brandModel from "../../../../DataBase/Models/Brand.Model.js";
import categoryModel from "../../../../DataBase/Models/Category.Model.js";
import productModel from "../../../../DataBase/Models/Product.Model.js";
import subcategoryModel from "../../../../DataBase/Models/SubCategory.Model.js";
import { asyncHandler } from "../../../Utils/ErrorHandling.js";
import cloudinary from "../../../Utils/cloudinary.js";
import { pagination } from "../../../Utils/pagination.js";
import { AdvancedSearch } from "../../../Utils/advancedSearch.js";

export const addProducut = asyncHandler(async (req, res, next) => {
  req.body.name = req.body.name.toLowerCase();

  //checking if product name was already used or not.
  const product_exist = await productModel.findOne({ name: req.body.name });
  if (product_exist) {
    product_exist.stock += parseInt(req.body.stock);
    await product_exist.save();
    return res.status(200).json({
      Message:
        "Product Name is already used but we added the stock quantity to the original product.",
    });
  }

  //checking if the category id is correct.
  const category_exist = await categoryModel.findById(req.body.categoryId);
  if (!category_exist) {
    return next(new Error("Invalid category id."));
  }

  //checking if subcategory id exists.
  const subcategory_exist = await subcategoryModel.findById(
    req.body.subcategoryId
  );
  if (!subcategory_exist) {
    return next(new Error("Invalid subcategory id."));
  }

  //checking if brand id exists.
  const brand_exist = await brandModel.findById(req.body.brandId);
  if (!brand_exist) {
    return next(new Error("Invalid brand id."));
  }

  //updating the request body to match the product.
  req.body.slug = slugify(req.body.name);
  req.body.price = parseFloat(req.body.price);
  req.body.discount = parseFloat(req.body.discount);
  req.body.stock = parseInt(req.body.stock);
  req.body.createdBy = req.user._id;
  req.body.paymentPrice =
    req.body.price - req.body.price * ((req.body.discount || 0) / 100);
  

  //uploading the product image.
  const uploadedImage = await cloudinary.uploader.upload(
    req.files.image[0].path,
    { folder: `Ecommerce/Products/Images` }
  );

  //changing the req image in body.
  req.body.image = {
    secure_url: uploadedImage.secure_url,
    public_id: uploadedImage.public_id,
  };

  if (req.files.coverImages) {
    //uploading the product cover images.
    const uploadedCoverImages = [];
    for (let index = 0; index < req.files.coverImages.length; index++) {
      const key = req.files.coverImages[index];
      const uploadedCoverImage = await cloudinary.uploader.upload(key.path, {
        folder: `Ecommerce/Products/CoverImages`,
      });

      //adding the cover image uploaded to the array.
      uploadedCoverImages.push({
        secure_url: uploadedCoverImage.secure_url,
        public_id: uploadedCoverImage.public_id,
      });
    }
    //editing the coverimage array.
    req.body.coverImages = uploadedCoverImages;
  } else {
    req.body.coverImages = [{}];
  }
  
  const product = await productModel.create(req.body);

  res.status(201).json({ Product: product });
});

export const updateProducut = asyncHandler(async (req, res, next) => {});

export const deleteProducut = asyncHandler(async (req, res, next) => {  //don't forget to delete the product from the cart and order.

});

export const getProducuts = asyncHandler(async (req, res, next) => {
  //we are creating a object of advanced search class
  let advancedSearch = new AdvancedSearch(productModel, req.query);

  const products = await advancedSearch.getSearchResult(); //reteving search result data.
  //const products = await advancedSearch.getSearchResultAndPopulate(["subcategoryId","brandId"]);  //reteving search result data with population.
  const productsCount = await advancedSearch.getItemsCount(); //getting count of items in the database.
  const totalPages = await advancedSearch.getPagesCount(productsCount); //getting total number of pages when paginating

  res.status(200).json({ products, productsCount, totalPages });
});

export const getProducutById = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;
  const product = await productModel.findById(productId);

  res.status(200).json({ resu });
});
// export const getPaginatedProducuts = asyncHandler(async (req, res, next) => {
//   const { page, size } = req.query;
//   let { skip, limit } = pagination(size, page);

//   //we are fitering the query parameters to match the filter fields.
//   const exclude_for_filter = ["sort", "page", "size", "fields", "name", "desc"];
//   //deep copying request query.
//   let filterQuery = { ...req.query };
//   //deleteing any excess query params so it can match the filter.
//   exclude_for_filter.forEach((element) => {
//     delete filterQuery[element];
//   });

//   //replacing the space before the keywords to be suitable to search with.
//   filterQuery = JSON.stringify(filterQuery).replace(
//     /lte|lt|gte|gt/g,
//     (match) => {
//       return `$${match}`;
//     }
//   );

//   //returning the filtered query to a json object.
//   filterQuery = JSON.parse(filterQuery);
//   const sortQuery = req.query.sort?.replace(/,/g, " ");
//   const selectQuery = req.query.fields?.replaceAll(",", " ");

//   let search = productModel.find(filterQuery);
//   search.skip(skip).limit(limit);
//   search.sort(sortQuery);
//   if (req.query.name || req.query.desc) {
//     search.find({
//       $or: [
//         { name: { $regex: `${req.query.name}` } },
//         { description: { $regex: `${req.query.desc}` } },
//       ],
//     });
//   }

//   search.select(selectQuery);

//   const products = await search;

//   res.json(products);
// });
