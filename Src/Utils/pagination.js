export const pagination = (size, page) => {
  //if there was an error in the sent parameters.
  if (size <= 0 || size == undefined) size = 5;
  if (page <= 0 || page == undefined) page = 1;

  //calculating the skip
  const skip = size * (page - 1);

  return { skip, limit: size };
};
