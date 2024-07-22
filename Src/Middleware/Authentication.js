import jwt from "jsonwebtoken";
import { asyncHandler } from "../Utils/ErrorHandling.js";
import { decryptToken } from "../Utils/encryptAndDecrypt.js";
import ErrorClass from "../Utils/errorClass.js";
import userModel from "../../DataBase/Models/User.Model.js";

export const roles={
    user:"User",
    admin:"Admin"
}
Object.freeze(roles);

//authentication middleware to decrypt token and check for errors.
export const userAuthMiddleware = (roles=[])=>{
    return (async (req, res, next) => {
        const berearToken = req.headers.token;
      
        //checking if the bearer token starts with the right bearer signiture
        if ( berearToken==undefined || !berearToken.startsWith(process.env.BEARER_TOKEN)) {
          return next(new ErrorClass("Invalid bearer token.",404));
        }
        //extracting the original token
        const token = berearToken.split(process.env.BEARER_TOKEN)[1];
        
        //decrypting token then checking if it's valid or not.
        const decryptedToken = decryptToken({token});

        if (decryptedToken == undefined) {
          return next(new ErrorClass("Invalid Token.",404));
        }

        //checking if user id in token is valid or not.
        const user = await userModel.findById(decryptedToken.id);
        if (user == null) {
          return next(new ErrorClass("User does not exist.",404));
        }

        if(!user.verifiedEmail){
            return next(new ErrorClass("Please activate this account first.",404));
        }
      
        if(!roles.includes(user.role)){
            return next(new ErrorClass("This account is not authorized.",404));
        }
        req.user = user;
        return next();
      });
}
