import { RESPONSE_CODES } from '@config/constants';
import { NAME, PATHS, VERSION } from '@config/environment';
import { BaseRouter, Validators } from '@routes/base.router';
import { V1Route } from '@routes/v1';
import express, { NextFunction, Request, Response } from 'express';

export class MainRouter extends BaseRouter {
  constructor(validators?: Validators) {
    super(validators);

    this.get404 = this.get404.bind(this);
    this.other501 = this.other501.bind(this);

    this.router.use('/assets', express.static(PATHS.ASSETS));
    this.router.use('/public', express.static(PATHS.PUBLIC));
    this.router.use('/v1', V1Route.router);

    this.router.get('/*', this.get404);
    this.router.use('/*', this.other501);
  }

  protected async getAll(req: Request, res: Response): Promise<void> {
    this.logger.debug(`app called via ${req.hostname} with ${req.method}`);
    this.format(req, res, {
      plain: `You are on ${NAME} in version '${VERSION}'`,
      json: {
        name: NAME,
        version: VERSION,
        ...this.requestDetails(req),
      },
    });
  }

  private async get404(req: Request, res: Response): Promise<void> {
    this.debugErrorRequest(req);
    this.format(req, res, {
      plain: '404 - page not found',
      json: { errors: [{ code: RESPONSE_CODES.NOT_FOUND, message: 'page not found' }], ...this.requestDetails(req) },
    }, RESPONSE_CODES.NOT_FOUND);
  }

  private async other501(req: Request, res: Response, next: NextFunction): Promise<void> {
    this.debugErrorRequest(req);
    this.format(req, res, {
      plain: '501 - not implemented',
      json: {
        errors: [{
          code: RESPONSE_CODES.NOT_IMPLEMENTED,
          message: 'not implemented',
        }], ...this.requestDetails(req),
      },
    }, RESPONSE_CODES.NOT_IMPLEMENTED);
    next();
  }

  private debugErrorRequest(req: Request): void {
    this.logger.debug(`${req.ip} tried: ${req.method} on ${req.baseUrl || '/'}`);
  }
}
