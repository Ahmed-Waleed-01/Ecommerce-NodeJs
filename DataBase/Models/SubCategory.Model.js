import mongoose, { Schema, model } from "mongoose";

const subcategorySchema = new Schema(
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
    image: {
      secure_url: { type: String, required: true },
      public_id: { type: String, required: true },
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: false,
      default: null, // we need to change this
    },
    categoryId: {
      type: mongoose.Types.ObjectId,
      ref: "Category",
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const subcategoryModel = model("Subcategory", subcategorySchema);

export default subcategoryModel;
