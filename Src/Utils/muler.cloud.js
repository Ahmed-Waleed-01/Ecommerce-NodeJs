import multer from "multer";

export const fileValidation = {
  image: ["image/jpeg", "image/png", "image/gif"],
  file: ["application/pdf", "application/msword"],
  video: ["video/mp4"],
};

export function uploadFile(customFileValidation = []) {
  const storage = multer.diskStorage({});

  //the filtiration function to check for the user upload extention
  function fileFilter(req, file, callBack) {
    if (customFileValidation.includes(file.mimetype)) {
      callBack(null, true);
    } else {
      callBack(new Error("Invalid upload format"), false);
    }
  }
  
  const upload = multer({fileFilter: fileFilter , storage });
  return upload;
}
