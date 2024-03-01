import cors from 'cors';
import express from 'express';
import path from 'path';
import routes from './configs/routes-config';

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
    this.server.use(
      '/uploads',
      express.static(path.join(path.resolve(), 'uploads'))
    );
    this.server.use('/api', routes.publicRoutes);
    // this.server.use(authMiddleware);
  }
  privateRoutes() {
    this.server.use('/api', routes.privateRoutes);
  }
}

export default new App().server;
