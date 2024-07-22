//array with all possible validation fields.
const validationFields = [
  "body",
  "params",
  "file",
  "query",
  "headers",
  "files",
];

//the middlware will take the validation Scheme as a parameter and then validate it .
export const validationMiddelware = (joiScheme) => {
  return (req, res, next) => {
    let validationErrors = [];

    //looping through the fields of the array and if the joi scheme uses one of the array values then we will validate on it.
    validationFields.forEach((element) => {
      if (joiScheme[element]) {
        const result = joiScheme[element].validate(req[element], {
          abortEarly: false,
        });

        if (result.error) {
          validationErrors.push(result.error.details);
        }
      }
    });

    if (validationErrors.length != 0) {
      return res.json({ Message: "Validation error", validationErrors });
    }
    return next();
  };
};
