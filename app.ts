import * as express from 'express';
import * as logger from 'morgan';
import * as mongoose from 'mongoose';
import * as compression from 'compression';
import * as cors from 'cors';

import { MONGO_CONNECTION_URL } from './util/secrets';
import usersRouter from './routes/userRoutes';

export default class Server {
  public app: express.Application;

  private connection: mongoose.Connection;

  constructor() {
    this.app = express();
    this.connection = mongoose.connection;
    this.config();
    this.routes();
    this.mongo();
  }

  public routes(): void {
    this.app.use('/user', new usersRouter().router);
    this.app.use((req, res, next) => {
      res.json({
        statusCode: 404,
      });
    });
    this.app.use((err, req, res, next) => {
      res.json({
        statusCode: 500,
        message: err.message,
        stack: err.stack,
      });
    });
  }

  public config(): void {
    this.app.use(logger('dev'));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));
    this.app.use(compression());
    this.app.use(cors());
  }

  private mongo() {
    this.connection.on('connected', () => {
      console.log('Mongo Connection Established');
    });
    this.connection.on('reconnected', () => {
      console.log('Mongo Connection Reestablished');
    });
    this.connection.on('disconnected', () => {
      console.log('Mongo Connection Disconnected');
      console.log('Trying to reconnect to Mongo ...');
      setTimeout(() => {
        mongoose.connect(MONGO_CONNECTION_URL, {
          useNewUrlParser: true,
          autoReconnect: true,
          keepAlive: true,
          socketTimeoutMS: 3000,
          connectTimeoutMS: 3000,
        });
      }, 3000);
    });
    this.connection.on('close', () => {
      console.log('Mongo Connection Closed');
    });
    this.connection.on('error', (error: Error) => {
      console.log(`Mongo Connection ERROR: ${error}`);
    });

    const run = async () => {
      await mongoose.connect(MONGO_CONNECTION_URL, {
        autoReconnect: true, keepAlive: true, useNewUrlParser: true,
      });
    };
    run().catch((error) => console.error(error));
  }
}
