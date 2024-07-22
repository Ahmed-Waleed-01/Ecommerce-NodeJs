import express from "express";
import dbConnection from "./DataBase/connection.js";
import dotenv from "dotenv";
import bootstrap from "./Src/index.router.js";
import { globalErrorHandler } from "./Src/Utils/ErrorHandling.js";
import chalk from "chalk";
dotenv.config();

const app = express();
app.use(express.json());
dbConnection();

bootstrap(app, express);

app.use(globalErrorHandler);

app.listen(parseInt(process.env.PORT), () => {
  console.log(chalk.red(`connected to the server on port: `+chalk.yellow(`${process.env.PORT}`) ));
});
