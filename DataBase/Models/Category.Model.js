import mongoose, { Schema, model } from "mongoose";

const categorySchema = new Schema(
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
    },
  },
  {
    timestamps: true,
    toJSON:{virtuals:true},
    toObject:{virtuals:true},
    id:false,
  }
);

categorySchema.virtual("subcategories", {
  localField: "_id",
  foreignField: "categoryId",
  ref: "Subcategory",
});

const categoryModel = model("Category", categorySchema);

export default categoryModel;
