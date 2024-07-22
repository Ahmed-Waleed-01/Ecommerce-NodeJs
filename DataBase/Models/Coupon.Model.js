import { Types, Schema, model } from "mongoose";

const couponSchema = new Schema({
  createdBy: {
    type: Types.ObjectId,
    ref: "User",
  },
  code:{type:String, required:true, unique:true,uppercase:true},
  discount:{
    type:Number, min:1,max:100,
  },
  noOfUses:{type:Number,required:true},
  expireDate:{type:Date, required:true, min:new Date()},
  usedBy:[{type:Types.ObjectId,ref:'User'}]
},{timestamps:true});

const couponModel= model ("Coupon",couponSchema);

export default couponModel;
