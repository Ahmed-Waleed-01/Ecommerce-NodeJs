import { nanoid } from "nanoid";
import userModel from "../../../../DataBase/Models/User.Model.js";
import brandModel from "../../../../DataBase/Models/Brand.Model.js";
import { asyncHandler } from "../../../Utils/ErrorHandling.js";
import cloudinary from "../../../Utils/cloudinary.js";
import ErrorClass from "../../../Utils/errorClass.js";
import { compareHashed, hashPassword } from "../../../Utils/hashAndCompare.js";
import {
  ReasonPhrases,
  StatusCodes,
  getReasonPhrase,
  getStatusCode,
} from "http-status-codes";
import {
  confirmEmailHtml,
  resetPasswordHTML,
  sendMail,
} from "../../../Utils/email.js";
import {
  decryptToken,
  generateToken,
} from "../../../Utils/encryptAndDecrypt.js";
import { roles } from "../../../Middleware/Authentication.js";
import subcategoryModel from "../../../../DataBase/Models/SubCategory.Model.js";
import productModel from "../../../../DataBase/Models/Product.Model.js";
import categoryModel from "../../../../DataBase/Models/Category.Model.js";
import cartModel from "../../../../DataBase/Models/Cart.Model.js";

//helping function that sends the verification email to user after signing up.
export const sendVerificationEmail = async (user, req, next) => {
  const link1 = `${req.protocol}://${req.headers.host}/user/confrimEmail/${user._id}/${user.confirmationCode}`;
  //const link2 = `${req.protocol}://${req.headers.host}/user/unsubscribe/${unsunscribeToken}`;
  const html = confirmEmailHtml(link1);
  const subject = await sendMail({
    from: process.env.APP_EMAIL,
    to: user.email,
    subject: "Confrim Email",
    html: html,
  });
};

export const signUpUser = asyncHandler(async (req, res, next) => {
  const cur_user = req.body;

  //checking to see if email was already used in database.
  let user_email_exist = await userModel.findOne({ email: cur_user.email });
  if (user_email_exist) {
    return next(new ErrorClass("Email is already used", 404));
  }

  //hasing the password to protect original password.
  const hashed_password = await hashPassword(cur_user.password);

  if (req.file) {
    const uploaded = await cloudinary.uploader.upload(req.file.path, {
      folder: `Ecommerce/Users`,
    });
    cur_user.profileImage = {
      secure_url: uploaded.secure_url,
      public_id: uploaded.public_id,
    };
  }

  //creating a new user.
  const newUser = await userModel.create({
    name: cur_user.name,
    email: cur_user.email,
    password: hashed_password,
    originalPass: cur_user.password,
    age: cur_user.age,
    gender: cur_user.gender,
    phone: cur_user.phone,
    profileImage: cur_user.profileImage,
    role: "User",
    DOB: cur_user.DOB,
    confirmationCode: nanoid(),
  });

  await cartModel.create({ userId: newUser._id });
  //sending a verification email using a function.
  sendVerificationEmail(newUser, req, next);

  //sending success response to user.
  res.json({
    Message:
      "User created successfully, Check your email inbox to activate your account.",
    newUser,
  });
});

export const signUpAdmin = asyncHandler(async (req, res, next) => {
  const cur_user = req.body;

  //checking to see if email was already used in database.
  let user_email_exist = await userModel.findOne({ email: cur_user.email });
  if (user_email_exist) {
    return next(new ErrorClass("Email is already used", 404));
  }

  //hasing the password to protect original password.
  const hashed_password = await hashPassword(cur_user.password);

  if (req.file) {
    const uploaded = await cloudinary.uploader.upload(req.file.path, {
      folder: `Ecommerce/Users`,
    });
    cur_user.profileImage = {
      secure_url: uploaded.secure_url,
      public_id: uploaded.public_id,
    };
  }

  //creating a new user.
  const newUser = await userModel.create({
    name: cur_user.name,
    email: cur_user.email,
    password: hashed_password,
    originalPass: cur_user.password,
    age: cur_user.age,
    gender: cur_user.gender,
    phone: cur_user.phone,
    profileImage: cur_user.profileImage,
    role: "Admin",
    DOB: cur_user.DOB,
    confirmationCode: nanoid(),
  });

  await cartModel.create({ userId: newUser._id });

  //sending a verification email using a function.
  sendVerificationEmail(newUser, req, next);

  //sending success response to user.
  res.json({
    Message:
      "User created successfully, Check your email inbox to activate your account.",
    newUser,
  });
});

export const confirmEmail = asyncHandler(async (req, res, next) => {
  const { userId, confirmationCode } = req.params;

  const user = await userModel.findById(userId);
  if (!user) {
    return next(
      new ErrorClass(
        "Invalid User Id, please check if your account has been deleted.",
        404
      )
    );
  }

  if (user.verifiedEmail) {
    return next(new ErrorClass("User is already verified.", 401));
  }

  if (user.confirmationCode != confirmationCode) {
    return next(new ErrorClass("Confirmation code is incorrect.", 404));
  }

  user.verifiedEmail = true;
  user.save();

  res
    .status(StatusCodes.OK)
    .json({ Message: "Congratualtion your account has been verified." });
});

export const signin = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await userModel.findOne({ email });
  if (!user) {
    return next(
      new ErrorClass("Invalid login credentials.", StatusCodes.NOT_ACCEPTABLE)
    );
  }

  const compareResult = await compareHashed(password, user.password);
  if (!compareResult) {
    return next(
      new ErrorClass("Invalid login credentials.", StatusCodes.NOT_ACCEPTABLE)
    );
  }

  const token = generateToken({
    payload: { id: user._id },
    expiresIn: 60 * 60,
  });

  res.status(StatusCodes.OK).json({ Message: "Login successfull.", token });
});

export const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  const user = await userModel.findOne({ email });
  if (!user) {
    return next(
      new ErrorClass(
        "if your account exists you will be sent an email with a link to reset your password.",
        StatusCodes.NOT_ACCEPTABLE
      )
    );
  }

  const resetPasswordToken = generateToken({
    payload: { id: user._id },
    expiresIn: 60 * 5,
  });

  const link = `${req.protocol}://${req.headers.host}/user/resetPassword/${resetPasswordToken}`;
  const emailHtml = resetPasswordHTML(link);

  await sendMail({
    to: user.email,
    subject: "Reset Password for ECommerce.",
    html: emailHtml,
  });

  res.status(StatusCodes.OK).json({
    Message:
      "if your account exists you will be sent an email with a link to reset your password.",
  });
});

export const resetPassword = asyncHandler(async (req, res, next) => {
  const { token } = req.params;

  const decrypted = await decryptToken({ token });

  if (decrypted == undefined) {
    return next(
      new ErrorClass(
        "Token is incorrect or has Expired.",
        StatusCodes.METHOD_NOT_ALLOWED
      )
    );
  }

  const user = await userModel.findById(id);
  if (!user) {
    return next(
      new ErrorClass(
        "User might have been deleted.",
        StatusCodes.METHOD_NOT_ALLOWED
      )
    );
  }

  const { newPassword, cpassword } = req.body;

  if (toString(newPassword) != toString(cpassword)) {
    return next(
      new ErrorClass(
        "your password does not match the confirm password.",
        StatusCodes.METHOD_NOT_ALLOWED
      )
    );
  }

  //hasing the password to protect original password.
  const hashed_password = await hashPassword(newPassword);
  user.password = hashed_password;
  user.originalPass = newPassword;
  user.save();

  res.status(StatusCodes.OK).json({
    Message: "user password has been updated successfully",
  });
});

export const updateUser = asyncHandler(async (req, res, next) => {
  const cur_user = req.body;

  //checking to see if email was already used in database.
  let user_email_exist = await userModel.findOne({ email: cur_user.email });
  if (user_email_exist) {
    return next(new ErrorClass("Email is already used", 404));
  }

  if (req.file) {
    //uploading new image.
    const uploaded = await cloudinary.uploader.upload(req.file.path, {
      folder: `Ecommerce/Users`,
    });
    cur_user.profileImage = {
      secure_url: uploaded.secure_url,
      public_id: uploaded.public_id,
    };

    //deleting old image
    const deleteImg = await cloudinary.uploader.destroy(
      req.user.profileImage.public_id
    );
  }

  //creating a new user.
  const updatedUser = await userModel.updateOne(
    { _id: req.user._id },
    {
      name: cur_user.name,
      email: cur_user.email,
      age: cur_user.age,
      phone: cur_user.phone,
      profileImage: cur_user.profileImage,
      confirmationCode: nanoid(),
    }
  );

  //sending success response to user.
  res.json({
    Message: "User Updated successfully",
    updatedUser,
  });
});

export const deleteUser = asyncHandler(async (req, res, next) => {
  const user = await userModel.findByIdAndDelete(req.user._id);

  //if the user was an admin that means we should make the all that are created by him not point on him.
  if (user.role == roles.admin) {
    const categories_Created = await categoryModel.find({
      createdBy: user._id,
    });
    for (let index = 0; index < categories_Created.length; index++) {
      const category = categories_Created[index];
      category.createdBy = null;
      category.save();
    }

    const subcategories_Created = await subcategoryModel.find({
      createdBy: user._id,
    });
    for (let index = 0; index < subcategories_Created.length; index++) {
      const subcategory = subcategories_Created[index];
      subcategory.createdBy = null;
      subcategory.save();
    }

    const brands_Created = await brandModel.find({
      createdBy: user._id,
    });
    for (let index = 0; index < brands_Created.length; index++) {
      const brand = brands_Created[index];
      brand.createdBy = null;
      brand.save();
    }

    const products_Created = await productModel.find({
      createdBy: user._id,
    });
    for (let index = 0; index < products_Created.length; index++) {
      const product = products_Created[index];
      product.createdBy = null;
      product.save();
    }

    const cart_Created = await cartModel.findOneAndRemove({
      userId: user._id,
    });
  }

  res.status(200).json({ Message: "User has been deleted successfully." });
});

export const changePassword = asyncHandler(async (req, res, next) => {
  const { oldPassword, newPassword, cPassword } = req.body;

  //if old password does not matche the current password.
  if (!(await compareHashed(oldPassword, req.user.password))) {
    return next(new ErrorClass("The old password you entered is incorrect."));
  }

  //check if the new password and confirm password are matching.
  if (cPassword.toString() != newPassword.toString()) {
    return next(
      new ErrorClass(
        "The new password you entered does not the match confirm Password."
      )
    );
  }

  //hashing the new password.
  const hashed_password = await hashPassword(newPassword);

  //updating the user password.
  const newUser = await userModel.updateOne(
    { _id: req.user._id },
    { password: hashed_password, originalPass: newPassword }
  );

  res
    .status(200)
    .json({ Message: "User password has been updated successfully." });
});

export const addToFavorites = asyncHandler(async (req, res, next) => {
  const { productId } = req.body;

  const product = await productModel.findById(productId);
  if (!product) {
    return next(new ErrorClass("Product is not found.", 404));
  }

  const user = await userModel.findByIdAndUpdate(req.user._id, {
    $addToSet: { favorites: productId },
  });

  res.json({Message:"Prodcut has been added to favorites."});
});

export const getFavorites = asyncHandler(async (req, res, next) => {

  const user = await userModel.findById(req.user._id).populate("favorites")
  user.favorites= user.favorites.filter(ele=>{
    if(ele)
    {
      return ele;
    }
  })  
  await user.save();
  
  res.json({favorites:user.favorites});
});
