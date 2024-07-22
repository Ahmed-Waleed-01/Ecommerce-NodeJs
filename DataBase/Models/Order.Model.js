import { Types, Schema, model } from "mongoose";

const orderSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    address: { type: String, required: true },
    products: [
      {
        productDetails: {
          name: { type: String, required: true },
          price: { type: Number, required: true },
          paymentPrice: { type: Number, required: true },
          productId: { type: Types.ObjectId, ref: "Product", required: true },
        },
        quantity: {
          type: Number,
          required: true,
          default: 1,
        },
      },
    ],
    phone: { type: String, required: true },
    note: String,
    coupon: { type: Types.ObjectId, ref: "Coupon" },
    price: { type: Number, required: true },
    paymentPrice: { type: Number, required: true },
    paymentMethod: { type: String, enum: ["card", "cash"], default: "cash" },
    status: {
      type: String,
      enum: ["waitingPayment", "placed", "cancelled", "rejected", "delivered"],
    },
    rejectReason: String,
  },
  { timestamps: true }
);

const orderModel = model("Order", orderSchema);

export default orderModel;
