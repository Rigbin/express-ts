import { BaseRouter, Validators } from '@routes/base.router';
import { requestDetails } from '@util/request';
import { Request, Response } from 'express';

export class V1Router extends BaseRouter {
  constructor(validators?: Validators) {
    super(validators);
  }

  protected async routes(): Promise<void> {
    // TODO...
  }

  protected async getAll(req: Request, res: Response): Promise<void> {
    this.format(req, res, {
      plain: 'API V1',
      json: { api: 'V1', ...requestDetails(req) },
    });
  }
}
