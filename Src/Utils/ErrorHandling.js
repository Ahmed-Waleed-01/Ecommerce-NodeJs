// export const asyncHandler = (func) => {
//   return (req, res, next) => {
//     return func(req, res, next).catch((err) => {
//       return next(new Error(err));
//     });
//   };
// };

import ErrorClass from "./errorClass.js";

//asyncHandler is an error catching mechanism that simulates the try and catch to stop any potential error from stopping the server.
export const asyncHandler = (func) => {
  return (req, res, next) => {
    return func(req, res, next).catch((err) => {
      //res.status(500).json({ "Error message": err.message });
      return next(new ErrorClass(err,500)); //it sends the error to a global error handler for express to use and display the error
    });
  };
};

//global error handler that express should use to display errors in your preffered way.
export const globalErrorHandler = (error, req, res, next) => {
  console.log({ ErrorMessage: error.message, ErrorStack: error.stack });
  return res.status(error.status||500).json({ ErrorMessage: error.message });
};
