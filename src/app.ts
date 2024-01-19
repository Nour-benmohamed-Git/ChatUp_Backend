import cors from "cors";
import express from "express";
import helmet from "helmet";
import routes from "./configs/routes-config";

class App {
  public server;
  constructor() {
    this.server = express();
    this.middlewares();
    this.routes();
    
  }
  
  middlewares() {
    this.server.use(express.json());
        // Basic security middlewares
        this.server.use(cors()); // Enable CORS
        this.server.use(helmet()); // Helps secure Express apps by setting various HTTP headers
  }
  routes() {
    this.server.use(routes);
  }
}

export default new App().server;
