import cors from 'cors';
import express from 'express';
import routes from './configs/routes-config';
import { authMiddleware } from './utils/middleware/authMiddleware ';

class App {
  public server;
  constructor() {
    this.server = express();
    this.middlewares();
    this.publicRoutes();
    this.privateRoutes();
  }

  middlewares() {
    this.server.use(express.json());
    this.server.use(cors());
  }
  publicRoutes() {
    this.server.use('/api', routes.publicRoutes);
    this.server.use(authMiddleware);
  }
  privateRoutes() {
    this.server.use('/api', routes.privateRoutes);
  }
}

export default new App().server;
