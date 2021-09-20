import { MainRoute } from '@app/routes';
import { CorsOptionsDelegate } from '@config/cors.settings';
import { NAME, NODE_ENV, VERSION } from '@config/environment';
import { RoutingErrorHandler } from '@middleware/error';
import { RequestLogging } from '@middleware/logging';
import { WSUpgrade } from '@middleware/ws';
import { LogFactory, Logger } from '@util/logger';
import cors from 'cors';
import express, { Express } from 'express';

export default class App {
  private static instance: App;

  protected logger: Logger;
  protected app: Express;

  protected constructor(private port: number) {
    this.app = express();
    this.logger = LogFactory.getLogger(this.constructor.name);
  }

  public static start(port: number): void {
    if (!this.instance) {
      this.instance = new App(port);
      this.instance.setMiddleware();
      this.instance.setRouter();
    }
    this.instance.start();
  }

  /**
   * To pre-inject separate routes (e.g. for testing), the setRouter will not be called in the constructor!
   */
  protected setRouter(): void {
    this.app.use(MainRoute.router);
    this.app.use(RoutingErrorHandler);
  }

  protected setMiddleware(): void {
    this.app.use(cors(CorsOptionsDelegate));
    this.app.use(RequestLogging);
    this.app.use(WSUpgrade());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(express.json({ limit: '5MB' }));
  }

  private start(): void {
    this.logger.info(`${NAME} starting...`);
    this.app.listen(this.port, () => {
      this.logger.info(`${NAME} successfully started and is listening on port ${this.port}`);
      this.logger.info(`${NAME} is running on environment '${NODE_ENV}'`);
      this.logger.info(`${NAME} is running in version '${VERSION}'`);
    });
  }
}
