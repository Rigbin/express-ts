import { BaseRouter, Validators } from '@routes/base.router';
import { requestDetails } from '@util/request';
import { Request, Response } from 'express';

/** Class that represents the Route `/v1` and start-point for all endpoints in this API-Version */
export class V1Router extends BaseRouter {
  constructor(validators?: Validators) {
    super(validators);
  }

  protected async routes(): Promise<void> {
    // TODO...
  }

  /**
   * GET /v1/
   * @param req
   * @param res
   * @return {string} 200 - success response - text/plain
   * @return {object} 200 - success response - application/json
   * @example response - 200
   * {
   *   "api": "V1",
   *   "url": "http://localhost:1234/v1/",
   *   "method": "GET",
   *   "timestamp": "Tue, 25 Jan 2022 13:07:36 GMT"
   * }
   * @return {string} 406 - invalid content type response - text/plain
   */
  protected async getAll(req: Request, res: Response): Promise<void> {
    this.format(req, res, {
      plain: 'API V1',
      json: { api: 'V1', ...requestDetails(req) },
    });
  }
}
