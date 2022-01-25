import { CORS_ALLOWED, NODE_ENV, PORT } from '@config/environment';
import { CustomError } from '@util/error';
import { CorsOptions, CorsOptionsDelegate as COD, CorsRequest } from 'cors';

/**
 * CORS-Whitelist. Extend to your needs
 * @see {@link CORS_ALLOWED}
 * */
const whitelist = [
  `http://localhost:${PORT}`,
  ...CORS_ALLOWED,
];

if (NODE_ENV === 'development') {
  whitelist.push('*');
}

/**
 * @see [cors npm package]{@link https://www.npmjs.com/package/cors#configuring-cors-w-dynamic-origin}
 */
export const CorsOptionsDelegate: COD = (req: CorsRequest,
  callback: (err: Error | null, options?: CorsOptions) => void,
): void => {
  const origin = req.headers.origin || '*';
  if (!origin || whitelist.indexOf(origin) >= 0) {
    return callback(null, {
      origin,
      methods: ['GET, HEAD'],
    });
  } else {
    const msg = `${origin} not allowed by CORS`;
    return callback(new CorsError(origin, msg));
  }
};

/** Custom error for cors related errors */
class CorsError extends CustomError {
  constructor(public origin: string, msg: string) {
    super(msg);
  }
}
