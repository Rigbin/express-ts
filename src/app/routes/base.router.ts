import { CONTENT_TYPES, RESPONSE_CODES } from '@config/constants';
import { keyExistsValidator, Validate } from '@middleware/validation';
import { LogFactory } from '@util/logger';
import { requestDetails } from '@util/request';
import { ResponseError } from '@util/response';
import { Request, Response, Router } from 'express';
import { ValidationChain } from 'express-validator';

/** Default Validators object to use when no validators are given */
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

/**  */
export type FormatData = {
  /** plain-text output for `res.format` */
  plain: string,
  /** json output for `res.format` */
  json: Record<string, unknown>,
  /** (optional) html output for `res.format` */
  html?: string,
  /** (optional) xml output for `res.format` */
  xml?: string,
  /** (optional) custom content-types output for `res.format` */
  custom?: Record<string, () => void>
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
    this.bind();

    this._router = Router();
    this.router.get('/', Validate(validators.get), this.getAll);
    this.router.post('/', Validate(validators.post), this.post);
    this.routes(validators);
    this.router.get('/:key', Validate(validators.get), this.getByKey);
    this.router.put('/:key', Validate(validators.put), this.put);
    this.router.delete('/:key', Validate(validators.delete), this.delete);
  }

  /**
   * @returns [Express `Router`](https://expressjs.com/en/api.html#router) to be used as reference in parent router.
   */
  public get router(): Router {
    return this._router;
  }

  /**
   * Method to put your **custom routes** into
   * Checkout [Express Routing](https://expressjs.com/en/guide/routing.html) for usage
   * Checkout `constructor` of `BaseRouter` for examples
   * When using custom methods as callsbacks, don't forget to `bind` them in `protected bind()`
   * @param _validators List of `Validators` that could be assigned via middleware [`Validate`](../middleware/validation/index.ts)
   *
   * ```typescript
   * this.router.get('/something', this.getSomething);
   * this.router.post('/data', Middleware, this.postData);
   * // ...
   * ```
   */
  protected async routes(_validators?: Validators): Promise<void> {
    // add your individual routes here (see constructor);
  }

  /**
   * Method to bind your custom methods.
   * Needed to function invocation as callback, at most are used in route definitions (see `constructor`)
   *
   * When you have custom methods, bind `this` to them as in this example
   * ```typescript
   * private myFunc(): any {}
   *
   * protected bind(): void {
   *  this.myFunc = this.myFunc.bind(this);
   * }
   * ```
   */
  protected bind(): void {
    // add your individual binds here (see constructor)
  }

  /**
   * default-callback for route GET '/'
   * @param req [Express `Request`](https://expressjs.com/en/api.html#req) object
   * @param res [Express `Response`](https://expressjs.com/en/api.html#res) object
   */
  protected async getAll(req: Request, res: Response): Promise<void> {
    return this.notImplemented(req, res);
  }

  /**
   * default-callback for route GET '/:key'
   * @param req [Express `Request`](https://expressjs.com/en/api.html#req) object
   * @param res [Express `Response`](https://expressjs.com/en/api.html#res) object
   * access the **key**-value through `req.params.key
   */
  protected async getByKey(req: Request, res: Response): Promise<void> {
    return this.notImplemented(req, res);
  }

  /**
   * default-callback for route POST '/'
   * @param req [Express `Request`](https://expressjs.com/en/api.html#req) object
   * @param res [Express `Response`](https://expressjs.com/en/api.html#res) object
   * access the post-body through `req.body`
   */
  protected async post(req: Request, res: Response): Promise<void> {
    return this.notImplemented(req, res);
  }

  /**
   * default-callback for route PUT '/:key'
   * @param req [Express `Request`](https://expressjs.com/en/api.html#req) object
   * @param res [Express `Response`](https://expressjs.com/en/api.html#res) object
   * access the **key**-value through `req.params.key`
   * access the put-body through `req.body`
   */
  protected async put(req: Request, res: Response): Promise<void> {
    return this.notImplemented(req, res);
  }

  /**
   * default-callback for route DELETE '/:key'
   * @param req [Express `Request`](https://expressjs.com/en/api.html#req) object
   * @param res [Express `Response`](https://expressjs.com/en/api.html#res) object
   * access the **key**-value through `req.params.key`
   */
  protected async delete(req: Request, res: Response): Promise<void> {
    return this.notImplemented(req, res);
  }

  /**
   * default response for unsupported content-type, e.g. when using a custom `res.format` response.
   * @param req [Express `Request`](https://expressjs.com/en/api.html#req) object
   * @param res [Express `Response`](https://expressjs.com/en/api.html#res) object
   */
  protected async unsupportedContentType(req: Request, res: Response): Promise<void> {
    res.status(RESPONSE_CODES.NOT_ACCEPTABLE).send(`${req.header('Accept')} not supported`);
  }

  /**
   * content-type based response
   * @param req [Express `Request`](https://expressjs.com/en/api.html#req) object
   * @param res [Express `Response`](https://expressjs.com/en/api.html#res) object
   * @param data `FormatData` to specify output for different content-types
   * @param status `number` Status-Code for response (default 200)
   */
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
        res.json({ errors: [new ResponseError(RESPONSE_CODES.NOT_IMPLEMENTED, message)], ...requestDetails(req) });
      },
      default: () => this.unsupportedContentType(req, res),
    });
  }
}
