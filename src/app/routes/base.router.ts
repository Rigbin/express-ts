import { CONTENT_TYPES, RESPONSE_CODES } from '@config/constants';
import { keyExistsValidator, Validate } from '@middleware/validation';
import { LogFactory } from '@util/logger';
import { Request, Response, Router } from 'express';
import { ValidationChain } from 'express-validator';

const emptyValidators = {
  get: <ValidationChain[]>[],
  post: <ValidationChain[]>[],
  put: <ValidationChain[]>keyExistsValidator,
  delete: <ValidationChain[]>keyExistsValidator,
};

export type Validators = {
  get?: ValidationChain[],
  post?: ValidationChain[],
  put?: ValidationChain[],
  delete?: ValidationChain[],
};

export type FormatData = {
  plain: string,
  json: Record<string, unknown>,
  html?: string,
  xml?: string,
  custom?: Record<string, () => void>
};

type RequestDetails = {
  url: string,
  method: string,
  body?: Record<string, unknown>,
  query?: Record<string, unknown>,
  timestamp: string
};

export abstract class BaseRouter {
  protected logger = LogFactory.getLogger(this.constructor.name);
  private readonly _router: Router;

  protected constructor(validators?: Validators) {
    validators = { ...emptyValidators, ...validators };

    this.getAll = this.getAll.bind(this);
    this.getByKey = this.getByKey.bind(this);
    this.post = this.post.bind(this);
    this.put = this.put.bind(this);
    this.delete = this.delete.bind(this);

    this._router = Router();
    this.router.get('/', Validate(validators.get), this.getAll);
    this.router.post('/', Validate(validators.post), this.post);
    this.router.put('/:key', Validate(validators.put), this.put);
    this.router.delete('/:key', Validate(validators.delete), this.delete);
  }

  public get router(): Router {
    return this._router;
  }

  protected async getAll(req: Request, res: Response): Promise<void> {
    return this.notImplemented(req, res);
  }

  protected async getByKey(req: Request, res: Response): Promise<void> {
    return this.notImplemented(req, res);
  }

  protected async post(req: Request, res: Response): Promise<void> {
    return this.notImplemented(req, res);
  }

  protected async put(req: Request, res: Response): Promise<void> {
    return this.notImplemented(req, res);
  }

  protected async delete(req: Request, res: Response): Promise<void> {
    return this.notImplemented(req, res);
  }

  protected async unsupportedContentType(req: Request, res: Response): Promise<void> {
    res.status(RESPONSE_CODES.NOT_ACCEPTABLE).send(`${req.header('Accept')} not supported`);
  }

  protected requestDetails(req: Request): RequestDetails {
    return {
      url: `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`,
      method: req.method,
      body: req.body && Object.keys(req.body).length > 0 ? req.body : undefined,
      query: req.query && Object.keys(req.query).length > 0 ? req.query : undefined,
      timestamp: new Date().toUTCString(),
    };
  }

  protected format(req: Request, res: Response, data: FormatData, status = RESPONSE_CODES.OK): void {
    const format: Record<string, () => void> = {
      [CONTENT_TYPES.PLAIN]: () => {
        res.send(data.plain);
      },
      [CONTENT_TYPES.JSON]: () => {
        res.json(data.json);
      },
      default: () => this.unsupportedContentType(req, res),
      ...data.custom,
    };
    if (data.html) { format[CONTENT_TYPES.HTML] = () => { res.send(data.html); }; }
    if (data.xml) { format[CONTENT_TYPES.XML] = () => { res.send(data.xml); }; }

    res.status(status).format(format);
  }

  private async notImplemented(req: Request, res: Response): Promise<void> {
    const message = `${this.constructor.name} has not implemented ${req.method} on ${req.path}`;
    res.status(RESPONSE_CODES.NOT_IMPLEMENTED).format({
      [CONTENT_TYPES.PLAIN]: () => {
        res.send(message);
      },
      [CONTENT_TYPES.JSON]: () => {
        res.json({ errors: [{ message }], ...this.requestDetails(req) });
      },
      default: () => this.unsupportedContentType(req, res),
    });
  }
}
