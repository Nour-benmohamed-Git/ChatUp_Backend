import app from './app';
import { WebSocketServer } from './configs/WebSocketServer';
import { AppDataSource } from './configs/typeorm.config';

AppDataSource.initialize()
  .then(async () => {
    app.listen(process.env.SERVER_PORT);
    new WebSocketServer(app);
  })
  .catch((error) => {
    console.error('Error during Data Source initialization', error);
  });
