import express from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import * as core from 'express-serve-static-core';
import { ParsedQs } from 'qs';
import ws from 'ws';

// Original from https://github.com/tinyhttp/tinyws
// adapted to work with express

export interface WSRequest<
  P = core.ParamsDictionary,
  ResBody = unknown,
  ReqBody = unknown,
  ReqQuery = core.Query,
  Locals extends Record<string, unknown> = Record<string, unknown>
  > extends express.Request<P, ResBody, ReqBody, ReqQuery, Locals> {
  ws?: () => Promise<ws>;
}

export interface WSRequestHandler<
  P = ParamsDictionary,
  ResBody = unknown,
  ReqBody = unknown,
  ReqQuery = ParsedQs,
  Locals extends Record<string, unknown> = Record<string, unknown>
  > extends express.RequestHandler {
  (
    req: WSRequest<P, ResBody, ReqBody, ReqQuery, Locals>,
    res: express.Response<ResBody, Locals>,
    next: express.NextFunction
  ): void
}
export const WSUpgrade = (
  wsOptions?: ws.ServerOptions,
  wss: ws.Server = new ws.Server({ ...wsOptions, noServer: !0 }),
): WSRequestHandler/*(req: WSRequest, _: express.Response, next: express.NextFunction) => Promise<void> */ =>
  async (req: WSRequest, _: express.Response, next: express.NextFunction) => {
    if ((req.headers.upgrade || '')
      .split(',')
      .map(s => s.trim())
      .indexOf('websocket') === 0) {
      (req.ws = () => {
        return new Promise<ws>(resolve => {
          wss.handleUpgrade(req, req.socket, Buffer.alloc(0), wsi => {
            wss.emit('connection', wsi, req);
            resolve(wsi);
          });
        });
      });
    }
    await next();
  };
