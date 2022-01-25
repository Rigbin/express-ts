import { RESPONSE_CODES } from '@config/constants';
import { PATHS, PROJECT_NAME, PROJECT_VERSION } from '@config/environment';
import { BaseRouter, Validators } from '@routes/base.router';
import { V1Route } from '@routes/v1';
import { requestDetails } from '@util/request';
import { RequestDetails } from '@util/request/details';
import { ResponseError } from '@util/response';
import express, { Request, Response } from 'express';

/** MainRouter class, used as default start-point for application and as example implementation */
export class MainRouter extends BaseRouter {
  constructor(validators?: Validators) {
    super(validators);
  }

  override async routes(_validators?: Validators): Promise<void> {
    /** static place for assets that should be provided directly (e.g. images, videos, ...) */
    this.router.use('/assets', express.static(PATHS.ASSETS));
    /** static place for custom web content (e.g. documentation or administration pages) */
    this.router.use('/public', express.static(PATHS.PUBLIC));
    /** `v1` API route endpoint. add additional endpoints to `V1Router` */
    this.router.use('/v1', V1Route.router);

    this.router.get('/*', this.get404);
    this.router.use('/*', this.other501);
  }

  override bind(): void {
    this.get404 = this.get404.bind(this);
    this.other501 = this.other501.bind(this);
  }

  /**
   * GET /
   * @summary default-callback for GET '/'
   * @return {string} 200 - success response - text/plain
   * @return {Main_GetAllResponse} 200 - success response - application/json
   * @example response - 200
   * {
   *   "name": "express-ts",
   *   "version": "0.1.0",
   *   "url": "http://localhost:1234/",
   *   "method": "GET",
   *   "timestamp": "Tue, 25 Jan 2022 13:07:36 GMT"
   * }
   * @return {string} 406 - invalid content type response - text/plain
   */
  override async getAll(req: Request, res: Response): Promise<void> {
    this.logger.debug(`app called via ${req.hostname} with ${req.method}`);
    this.format(req, res, {
      plain: `You are on ${PROJECT_NAME} in version '${PROJECT_VERSION}'`,
      json: {
        name: PROJECT_NAME,
        version: PROJECT_VERSION,
        ...requestDetails(req),
      },
    });
  }

  /**
   * GET /*
   * @summary default-callback for all GET endpoints, that are not implemented (404)
   * @return {string} 404 - not found response - text/plain
   * @return {ResponseError} 404 - not found response - application/json
   * @example response - 404
   * {
   *   "errors": [
   *      {
   *        "msg": "page not found",
   *        "name": "ResponseError",
   *        "status": 404
   *      }
   *   ],
   *   "url": "http://localhost:1234/test",
   *   "method": "GET",
   *   "timestamp": "Tue, 25 Jan 2022 13:07:36 GMT"
   * }
   */
  private async get404(req: Request, res: Response): Promise<void> {
    this.debugErrorRequest(req);
    this.format(req, res, {
      plain: '404 - page not found',
      json: { errors: [new ResponseError(RESPONSE_CODES.NOT_FOUND, 'page not found')], ...requestDetails(req) },
    }, RESPONSE_CODES.NOT_FOUND);
  }

  /**
   * @summary default-callback for all endpoints (expect GET), that are not implemented (501)
   * @return {string} 501 - not implemented response - text/plain
   * @return {ResponseError} 501 - not implemented response - application/json
   * @example response - 501
   * {
   *   "errors": [
   *      {
   *        "msg": "not implemented",
   *        "name": "ResponseError",
   *        "status": 501
   *      }
   *   ],
   *   "url": "http://localhost:1234/test",
   *   "method": "POST",
   *   "timestamp": "Tue, 25 Jan 2022 13:07:36 GMT"
   * }
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

/**
 * JSON-Response on GET /
 * @typedef {allOf|RequestDetails|object} Main_GetAllResponse
 * @property {string} name.required - name of application
 * @property {string} version.required - version of application
 */
export type Main_GetAllResponse = RequestDetails & {
  name: string;
  version: string;
}
