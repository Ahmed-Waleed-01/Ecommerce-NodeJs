import { Schema, Types, model } from "mongoose";

const productSchema = new Schema(
  {
    name: {
      type: String,
      unique: true,
      required: true,
    },
    slug: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    stock: {
      type: Number,
      min: 0,
      required: true,
      default: 1,
    },
    price: {
      type: Number,
      min: 0,
      required: true,
      default: 1,
    },
    paymentPrice: {
      type: Number,
      min: 0,
    },
    discount: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    colors: [
      {
        type: String,
      },
    ],
    sizes: [
      {
        type: String,
      },
    ],
    image: {
      secure_url: { type: String, required: true },
      public_id: { type: String, required: true },
    },
    coverImages: [
      {
        secure_url: { type: String },
        public_id: { type: String },
      },
    ],
    createdBy: {
      type: Types.ObjectId,
      ref: "User",
      required: false,
    },
    categoryId: {
      type: Types.ObjectId,
      ref: "Category",
      required: true,
    },
    subcategoryId: {
      type: Types.ObjectId,
      ref: "Subcategory",
      required: true,
    },
    brandId: {
      type: Types.ObjectId,
      ref: "Brand",
      required: true,
    },
    avgRating: {
      type: Number,
      default:0
    },
    reviewCount:{
      type:Number,
      default:0,
    },
    sold: {
      type: Number,
      default: 0,
    },
    QRcode: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const productModel = model("Product", productSchema);

export default productModel;
