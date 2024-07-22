import { Types, Schema, model } from "mongoose";

const reviewSchema = new Schema(
  {
    comment: { type: String },
    rating: {
      type: Number,
      min: 1,
      max: 10,
      required: true,
    },
    createdBy: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    productId: {
      type: Types.ObjectId,
      ref: "Prodcut",
      required: true,
    },
  },
  { timestamps: true }
);

const reviewModel = model("Review", reviewSchema);

export default reviewModel;
