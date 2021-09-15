import { Express, Request, Response } from 'express';
import { agent as request, Response as TestResponse } from 'supertest';
import App from '../../src/app/app';

class AppFake extends App {
  constructor() {
    super(0);
    this.app.use('/errortest', ((_req: Request, _res: Response) => {
      throw new Error('');
    }));
    this.setRouter();
  }

  public getAppForTest(): Express { return this.app; }
}

const TestApp = request(new AppFake().getAppForTest());

export { TestApp, Request, Response, TestResponse };
