import { Request } from 'express';
import { NODE_ENV, PORT } from './environment';

/** CORS-Whitelist. Extend to your needs */
const whitelist = [
  `http://localhost:${PORT}`,
];

if (NODE_ENV === 'development') {
  whitelist.push('*');
}

export const CorsOptionsDelegate = (req: Request,
  callback: (err: Error, options?: { origin: string, methods: string[] }) => void,
): void => {
  const origin = req.header('Origin') || '*';
  if (!origin || whitelist.indexOf(origin) >= 0) {
    return callback(null, {
      origin,
      methods: ['GET, HEAD'],
    });
  } else {
    const msg = `${origin} not allowed by CORS`;
    return callback(new Error(msg));
  }
};
