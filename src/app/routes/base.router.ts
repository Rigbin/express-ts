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
  get: ValidationChain[],
  post: ValidationChain[],
  put: ValidationChain[],
  delete: ValidationChain[],
};

/**
 * @property {string} plain.required - plain-text output for `res.format`
 * @property {object} json.required - json output for `res.format`
 * @property {string} html - *optional* html output for `res.format`
 * @property {string} xml - *optional* xml output for `res.format`
 * @property {*} custom - *optional* custom content-types output for `res.format`
 * */
export type FormatData = {
  plain: string,
  json: Record<string, unknown>,
  html?: string,
  xml?: string,
  custom?: Record<string, () => void>
};

/** Basic Router class, every router in project should extend from it */
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
   * @return {Router} router to be used as reference in parent router.
   */
  public get router(): Router {
    return this._router;
  }

  /**
   * Method to add your **custom routes**
   *
   * @see {@link https://expressjs.com/en/guide/routing.html Express Routing}
   * @see {@link constructor constructor()} for examples
   *
   * When using custom methods as callbacks, don't forget to
   * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_objects/Function/bind bind}
   * them in {@link bind protected bind()}
   *
   * @param _validators List of {@link Validators} that could be assigned via middleware {@link Validate}
   *
   * @example
   * this.router.get('/something', this.getSomething);
   * this.router.post('/data', Middleware, this.postData);
   */
  protected routes(_validators?: Validators): void {
    // add your individual routes here (see constructor);
  }

  /**
   * Method to bind your custom methods.
   * Needed for {@link https://www.w3schools.com/js/js_function_invocation.asp function invocation} as callback,
   * at most are used in route definitions (see {@link constructor constructor()})
   *
   * When you have custom methods, bind `this` to them as in the following example
   * @example
   * private myFunc(): any {}
   *
   * protected bind(): void {
   *  this.myFunc = this.myFunc.bind(this);
   * }
   */
  protected bind(): void {
    // add your individual binds here (see constructor)
  }

  /**
   * default-callback for route GET '/'
   * @param {Request} req
   * @param {Response} res
   */
  protected async getAll(req: Request, res: Response): Promise<void> {
    return this.notImplemented(req, res);
  }

  /**
   * default-callback for route GET '/:key'
   * @param {Request} req
   * @param {Response} res
   * access the **key**-value through `req.params.key
   */
  protected async getByKey(req: Request, res: Response): Promise<void> {
    return this.notImplemented(req, res);
  }

  /**
   * default-callback for route POST '/'
   * @param {Request} req
   * @param {Response} res
   * access the post-body through `req.body`
   */
  protected async post(req: Request, res: Response): Promise<void> {
    return this.notImplemented(req, res);
  }

  /**
   * default-callback for route PUT '/:key'
   * @param {Request} req
   * @param {Response} res
   * access the **key**-value through `req.params.key`
   * access the put-body through `req.body`
   */
  protected async put(req: Request, res: Response): Promise<void> {
    return this.notImplemented(req, res);
  }

  /**
   * default-callback for route DELETE '/:key'
   * @param {Request} req
   * @param {Response} res
   * access the **key**-value through `req.params.key`
   */
  protected async delete(req: Request, res: Response): Promise<void> {
    return this.notImplemented(req, res);
  }

  /**
   * default response for unsupported content-type, e.g. when using a custom `res.format` response.
   * @param {Request} req
   * @param {Response} res
   */
  protected async unsupportedContentType(req: Request, res: Response): Promise<void> {
    res.status(RESPONSE_CODES.NOT_ACCEPTABLE).send(`${req.header('Accept')} not supported`);
  }

  /**
   * content-type based response
   * @param {Request} req
   * @param {Response} res
   * @param {FormatData} data to specify output for different content-types
   * @param {number} status code for response (default 200)
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


  /**
   * default response for routes that are not implemented yet
   * @param {Request} req
   * @param {Response} res
   */
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
