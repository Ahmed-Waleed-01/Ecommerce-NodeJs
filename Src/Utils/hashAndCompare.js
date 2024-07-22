import bcrypt from "bcrypt";

export const hashPassword = async (password) => {
  const hashed = bcrypt.hashSync(password, parseInt(process.env.SALT_ROUND));
  return hashed;
};

export const compareHashed = async (stringPassword, hashedPassword) => {
  const result = bcrypt.compareSync(stringPassword, hashedPassword);
  return result;
};
