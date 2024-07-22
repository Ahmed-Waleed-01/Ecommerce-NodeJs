import { StatusCodes } from "http-status-codes";
import cartModel from "../../../../DataBase/Models/Cart.Model.js";
import productModel from "../../../../DataBase/Models/Product.Model.js";
import { asyncHandler } from "../../../Utils/ErrorHandling.js";
import ErrorClass from "../../../Utils/errorClass.js";

export const addToCart = asyncHandler(async (req, res, next) => {
  const { productId, quantity } = req.body;

  //cheking if product exist
  const product = await productModel.findById(productId);
  if (!product) {
    return next(
      new ErrorClass(
        "Can't find product, Id is invalid.",
        StatusCodes.NOT_FOUND
      )
    );
  }

  //if the quantity the user wanted is over the stock we have for the product.
  if (quantity > product.stock) {
    if (product.stock == 0) {
      return next(
        new ErrorClass(
          `Product ${product.name} is currently out of stock`,
          StatusCodes.NOT_ACCEPTABLE
        )
      );
    }
    return next(
      new ErrorClass(
        `The quantity you requested for ${product.name} is ${quantity}, which exceeds our stock of ${product.stock}`,
        StatusCodes.NOT_ACCEPTABLE
      )
    );
  }

  //getting cart of the user.
  const cart = await cartModel.findOne({ userId: req.user._id });

  //checking if the product was already in the cart or not.
  let product_index = -1;
  for (const index in cart.products) {
    const cur_product = cart.products[index];
    if (cur_product.productId.toString() == productId) {
      product_index = index;
      break;
    }
  }

  //if the product wasn't in the cart already then add it.
  if (product_index == -1) {
    cart.products.push({ productId, quantity });
  } else {
    cart.products[product_index].quantity = quantity;
  }
  await cart.save();

  res.json({
    Message: `Prodcut ${product.name} has been added successfully`,
    cart,
  });
});

export const showCart = asyncHandler(async (req, res, next) => {
  const cart = await cartModel
    .findOne({ userId: req.user._id })
    .populate([
      {
        path: "products.productId",
        select: "name price paymentPrice stock",
      },
    ])
    .select(-"userId");

  let totalPrice = 0;
  //filter products that might have not been properly deleted and are still in the cart.
  cart.products = cart.products.filter((element) => {
    if (element.productId) {
      totalPrice += element.quantity * element.productId.paymentPrice;
      return element;
    }
  });
  //saving the cart.
  await cart.save();

  res.json({ cart, totalPrice });
});
