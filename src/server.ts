import app from "./app";
import { AppDataSource } from "./configs/typeorm.config";

AppDataSource.initialize()
  .then(async () => {
    console.log("Data Source has been initialized!");
     app.listen(process.env.SERVER_PORT);
  })
  .catch((error) => {     
    console.error("Error during Data Source initialization", error);
  });
