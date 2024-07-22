import orderModel from "../../../../DataBase/Models/Order.Model.js";
import productModel from "../../../../DataBase/Models/Product.Model.js";
import reviewModel from "../../../../DataBase/Models/Review.Model.js";
import { asyncHandler } from "../../../Utils/ErrorHandling.js";
import ErrorClass from "../../../Utils/errorClass.js";

export const addReview = asyncHandler(async (req, res, next) => {
  const { rating, comment, productId } = req.body;

  const product = await productModel.findById(productId);
  if (!product) {
    return next(new ErrorClass("This product does not exist", 404));
  }

  //check if he has purchased this product
  const check_buying = await orderModel.findOne({
    userId: req.user._id,
    status: "placed" || "delivered",
    "products.productDetails.productId": productId,
  });
  if (!check_buying) {
    return next(
      new ErrorClass(
        "You can't review this product unless you have bought it first. ",
        409
      )
    );
  }

  //check if he has already made a review
  const review_exist = await reviewModel.findOne({
    createdBy: req.user._id,
    productId,
  });
  if (review_exist) {
    return next(new ErrorClass("You have already reviewed this product.", 409));
  }

  //updating the product review and product review count.
  product.avgRating =
    (product.avgRating * product.reviewCount + rating) /
    (product.reviewCount + 1);
  product.reviewCount++;
  product.save();

  const review = await reviewModel.create({
    createdBy: req.user._id,
    productId: product._id,
    comment,
    rating,
  });

  res
    .status(201)
    .json({ Message: "Review has been created successfully", review });
});

export const updateReview = asyncHandler(async (req, res, next) => {
  const { rating, comment } = req.body;
  const { reviewId } = req.params;

  //check if he has already made a review
  const review_exist = await reviewModel.findById(reviewId);
  if (!review_exist) {
    return next(new ErrorClass("No review with the same id.", 404));
  }

  if (review_exist.createdBy.toString() != req.user._id.toString()) {
    return next(
      new ErrorClass(
        "You are not allowed to update a review not made by yourself.",
        409
      )
    );
  }

  const product = await productModel.findById(review_exist.productId);

  if (rating) {
    //updating the product review and product review count.
    product.avgRating =
      (product.avgRating * product.reviewCount - review_exist.rating + rating) /
      product.reviewCount;
    product.save();
    review_exist.rating = rating;
  }

  if (comment) {
    review_exist.comment = comment;
  }

  await review_exist.save();

  res.status(202).json({
    Message: "Review has been updated successfully",
    review: review_exist,
  });
});

export const deleteReview = asyncHandler(async (req, res, next) => {
  const { reviewId } = req.params;

  //check if he has already made a review
  const review_exist = await reviewModel.findOneAndDelete({
    _id: reviewId,
    createdBy: req.user._id,
  });
  if (!review_exist) {
    return next(new ErrorClass("No review matches this id.", 404));
  }

  const product = await productModel.findById(review_exist.productId);

  //if the number of reviews was one then just make it zero because we don't want to divide by zero, else recalculate the avgrating
  product.avgRating =
    product.reviewCount == 1
      ? 0
      : (product.avgRating * product.reviewCount - review_exist.rating) /
        (product.reviewCount - 1);

  product.reviewCount--;
  product.save();

  res.status(200).json({
    Message: "Review has been deleted successfully",
    review: review_exist,
  });
});

export const showProductReview = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;

  //check if he has already made a review
  const review_exist = await reviewModel
    .find({
      productId,
    })
    .populate([
      {
        path: "createdBy",
        select: "name age",
      },
    ]);
  if (!review_exist) {
    return next(new ErrorClass("No review matches this id.", 404));
  }

  res.status(200).json({
    Message: "Done",
    reviews: review_exist,
  });
});
