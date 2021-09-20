import { RESPONSE_CODES } from '@config/constants';
import { NAME, PATHS, VERSION } from '@config/environment';
import { BaseRouter, Validators } from '@routes/base.router';
import { V1Route } from '@routes/v1';
import { requestDetails } from '@util/request';
import { ResponseError } from '@util/response';
import express, { Request, Response } from 'express';

export class MainRouter extends BaseRouter {
  constructor(validators?: Validators) {
    super(validators);
  }

  protected async routes(_validators?: Validators): Promise<void> {
    // static place for assets that should be provided directly (e.g. images, videos, ...)
    this.router.use('/assets', express.static(PATHS.ASSETS));
    // static place for custom web content (e.g. documentation or administration pages)
    this.router.use('/public', express.static(PATHS.PUBLIC));
    // `v1` API route endpoint. add additional endpoints to `V1Router`
    this.router.use('/v1', V1Route.router);

    this.router.get('/*', this.get404);
    this.router.use('/*', this.other501);
  }

  protected bind(): void {
    this.get404 = this.get404.bind(this);
    this.other501 = this.other501.bind(this);
  }

  /**
   * custom-callback for GET '/'
   * @param req [Express `Request`](https://expressjs.com/en/api.html#req) object
   * @param res [Express `Response`](https://expressjs.com/en/api.html#res) object
   * response will be information about application (name, version, ...)
   */
  protected async getAll(req: Request, res: Response): Promise<void> {
    this.logger.debug(`app called via ${req.hostname} with ${req.method}`);
    this.format(req, res, {
      plain: `You are on ${NAME} in version '${VERSION}'`,
      json: {
        name: NAME,
        version: VERSION,
        ...requestDetails(req),
      },
    });
  }

  /**
   * default-callback for all GET endpoints, that are not implemented (404)
   * @param req [Express `Request`](https://expressjs.com/en/api.html#req) object
   * @param res [Express `Response`](https://expressjs.com/en/api.html#res) object
   */
  private async get404(req: Request, res: Response): Promise<void> {
    this.debugErrorRequest(req);
    this.format(req, res, {
      plain: '404 - page not found',
      json: { errors: [new ResponseError(RESPONSE_CODES.NOT_FOUND, 'page not found')], ...requestDetails(req) },
    }, RESPONSE_CODES.NOT_FOUND);
  }

  /**
   * default-callback for all endpoints (expect GET), that are not implemented (501)
   * @param req [Express `Request`](https://expressjs.com/en/api.html#req) object
   * @param res [Express `Response`](https://expressjs.com/en/api.html#res) object
   */
  private async other501(req: Request, res: Response): Promise<void> {
    this.debugErrorRequest(req);
    this.format(req, res, {
      plain: '501 - not implemented',
      json: {
        errors: [new ResponseError(RESPONSE_CODES.NOT_IMPLEMENTED, 'not implemented')], ...requestDetails(req),
      },
    }, RESPONSE_CODES.NOT_IMPLEMENTED);
  }

  private debugErrorRequest(req: Request): void {
    this.logger.debug(`${req.ip} tried: ${req.method} on ${req.baseUrl || '/'}`);
  }
}
