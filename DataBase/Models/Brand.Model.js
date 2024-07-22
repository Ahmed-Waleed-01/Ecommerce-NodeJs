import { Types, Schema, model } from "mongoose";

const brandSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    image: {
      secure_url: { type: String, required: true },
      public_id: { type: String, required: true },
    },
    createdBy: {
      type: Types.ObjectId,
      ref: "User",
      required: false,
    },
  },
  { timestamps: true }
);

const brandModel = model("Brand", brandSchema);

export default brandModel;
