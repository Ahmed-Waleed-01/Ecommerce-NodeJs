import { Types, Schema, model } from "mongoose";
import { nanoid } from "nanoid";

const userSchema = new Schema(
  {
    name: { type: String, required: true, min: 2, max: 25 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    originalPass: {
      type: String,
    },
    age: {
      type: Number,
      min: 10,
      max: 120,
    },
    gender: {
      type: String,
      enum: ["MALE", "FEMALE"],
      default: "MALE",
      uppercase: true,
    },
    phone: {
      type: String,
    },
    role: {
      type: String,
      enum: ["User", "Admin"],
      default: "User",
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    verifiedEmail: {
      type: Boolean,
      default: false,
    },
    profileImage: {
      secure_url: { type: String,},
      public_id: { type: String,},
    },
    DOB: {
      type: Date,
      max:2015-1-1,//correct format is year-month-day
    },
    confirmationCode:{
        type:String,
        required:true,
    },
    favorites:[{type:Types.ObjectId,ref:"Product"}]
  },
  { timestamps: true }
);

const userModel = model("User", userSchema);

export default userModel;
