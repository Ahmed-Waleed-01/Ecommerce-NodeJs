import chalk from "chalk";
import mongoose from "mongoose";

const dbConnection = async () => {
  return await mongoose
    .connect(process.env.DB_LINK)
    .then(() => {
      console.log(chalk.cyan("Successfully connected to Database..."));
    })
    .catch((error) => {
      console.log(chalk.cyan("unable to connect to DataBase...."));
      console.log(error);
    });
};

export default dbConnection;
