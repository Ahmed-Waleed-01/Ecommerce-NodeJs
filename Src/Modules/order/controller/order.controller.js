import { asyncHandler } from "../../../Utils/ErrorHandling.js";
import cartModel from "../../../../DataBase/Models/Cart.Model.js";
import ErrorClass from "../../../Utils/errorClass.js";
import { populate } from "dotenv";
import couponModel from "../../../../DataBase/Models/Coupon.Model.js";
import productModel from "../../../../DataBase/Models/Product.Model.js";
import orderModel from "../../../../DataBase/Models/Order.Model.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_KEY);

export const createOrderFromCart = asyncHandler(async (req, res, next) => {
  const { couponCode, address, note, paymentMethod } = req.body;
  //phone is equal to user.phone, products are gonna come from cart.

  let coupon = undefined;
  if (couponCode) {
    const coupon_exist = await couponModel.findOne({ code: couponCode });
    if (!coupon_exist) {
      return next(new ErrorClass("Coupon code is incorrect.", 404));
    }
    if (coupon_exist.usedBy.length >= coupon_exist.noOfUses) {
      return next(new ErrorClass("Coupon usage limits has been reached.", 409));
    }
    if (coupon_exist.expireDate < new Date()) {
      return next(new ErrorClass("Coupon has expired.", 409));
    }
    if (coupon_exist.usedBy.includes(req.user._id)) {
      return next(new ErrorClass("User has already used this coupon.", 409));
    }
    coupon = coupon_exist;
  }

  //check if cart has products or is it empty.
  const cart = await cartModel.findOne({ userId: req.user._id });
  if (cart.products.length == 0) {
    return next(new ErrorClass("Your cart is empty.", 400));
  }

  let orderPrice = 0;
  const orderProducts = [];
  for (const index in cart.products) {
    let key = cart.products[index];
    const product_exist = await productModel.findById(key.productId);
    if (!product_exist) {
      return next(
        new ErrorClass(
          `Product with id ${key.productId} has been removed.`,
          400
        )
      );
    }
    if (product_exist.stock < key.quantity) {
      return next(
        new ErrorClass(
          `Product with ${product_exist.name} has only ${product_exist.stock} items left in stock.`,
          400
        )
      );
    }

    orderProducts.push({
      productDetails: {
        name: product_exist.name,
        price: product_exist.price,
        paymentPrice: product_exist.paymentPrice,
        productId: product_exist._id,
        imageUrl: product_exist.image.secure_url,
      },
      quantity: key.quantity,
    });

    //updating the product stock after buying a quantity from it.
    product_exist.stock = product_exist.stock - key.quantity;
    await product_exist.save();

    orderPrice += product_exist.paymentPrice * key.quantity;
  }

  const orderPaymentPrice =
    orderPrice - orderPrice * ((coupon?.discount || 0) / 100);

  const order = await orderModel.create({
    userId: req.user._id,
    address,
    products: orderProducts,
    phone: req.body.phone || req.user.phone,
    note,
    coupon: coupon?._id,
    price: orderPrice,
    paymentPrice: orderPaymentPrice,
    paymentMethod,
    status: paymentMethod == "card" ? "waitingPayment" : "placed", //if the payment method is card then make order status waitingPayment else make the order placed.
  });

  let paymentSession = undefined;
  //if the order is waiting for payment to be completed we will use stripe to create a payment gateway.
  if (order.status.toString() == "waitingPayment") {
    let stripeCoupon = undefined;
    if (coupon) {
      stripeCoupon = await stripe.coupons.create({
        percent_off: coupon.discount,
        max_redemptions: 200 /*this is the max amount of money to get discount. */,
        duration: "once",
      });
      stripeCoupon = stripeCoupon.id;
    }

    paymentSession = await stripe.checkout.sessions.create({
      metadata: {
        orderId: order._id.toString(),
      },
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: req.user.email,
      cancel_url: `${req.protocol}://${req.get("host")}/product`,
      success_url: `${req.protocol}://${req.get("host")}/product`,
      discounts: coupon ? [{ coupon: stripeCoupon }] : [],
      line_items: orderProducts.map((element) => {
        return {
          price_data: {
            currency: "EGP",
            product_data: {
              name: element.productDetails.name,
              images: [`${element.productDetails.imageUrl}`],
            },
            unit_amount: element.productDetails.paymentPrice * 100, //price of the product but it is saved in cents so we need to multiply the actual price with 100 to match how stripe calculates.
          },
          quantity: element.quantity,
        };
      }),
    });
  }

  //empty cart from products.
  cart.products=[]; await cart.save();
  
  //adding user to coupon.
  coupon.usedBy.push(req.user._id); coupon.noOfUses=coupon.noOfUses+1;
  coupon.save();

 
  res.status(201).json({ Message: "Order created successfully.","PaymentUrl":paymentSession?.url,order });
});

export const stripeWebhook = async (req, res) => {
  try {
    const sig = req.headers["stripe-signature"];

    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.END_POINT_SECRETE
    );

    if (event.type == "checkout.session.completed") {
      res.json({ event });
    } else {
      return next(new ErrorClass(`Unhandled event type ${event.type}`), 503);
    }
  } catch (error) {
    console.log(error);
  }
};
