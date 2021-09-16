import { Request } from 'express';

/**
 * @param req [Express `Request`](https://expressjs.com/en/api.html#req) object
 * @returns `RequestDetails`, details of the request to use in response
 */
export function requestDetails(req: Request): RequestDetails {
  return {
    url: `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`,
    method: req.method,
    body: req.body && Object.keys(req.body).length > 0 ? req.body : undefined,
    query: req.query && Object.keys(req.query).length > 0 ? req.query : undefined,
    timestamp: new Date().toUTCString(),
  };
}

export type RequestDetails = {
  /** full requested url (e.g. `http://localhost:1234/test?foo=bar) */
  url: string,
  /** request method (GET, POST, PUT, ...) */
  method: string,
  /** request body if given */
  body?: Record<string, unknown>,
  /** request query if given */
  query?: Record<string, unknown>,
  /** (current) timestamp */
  timestamp: string
};
