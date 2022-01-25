import { Request } from 'express';

/**
 * Helper function to create RequestDetails
 * @param {Request} req
 * @return {RequestDetails} details of the request to use in response
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

/**
 * Detail Information of Request
 * @typedef {object} RequestDetails
 * @property {string} url.required - full requested url (e.g. `http://localhost:1234/test?foo=bar`)
 * @property {string} method.required - request method (GET, POST, PUT, ...)
 * @property {string} timestamp.required - current timestamp
 * @property {object} body - request body (see <https://expressjs.com/en/api.html#req.body>)
 * @property {object} query - request query (see <https://expressjs.com/en/api.html#req.query>)
 * @example
 * {
 *   "url": "http://localhost:1234/test?foo=bar",
 *   "method": "GET",
 *   "query": {
 *     "foo": "bar"
 *   }
 *   "timestamp": "Tue, 25 Jan 2022 13:07:36 GMT>"
 * }
 */
export type RequestDetails = {
  url: string,
  method: string,
  timestamp: string
  body?: Record<string, unknown>,
  query?: Record<string, unknown>,
};
