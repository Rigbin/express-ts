import express from 'express';
import ws from 'ws';

// Original from https://github.com/tinyhttp/tinyws
// adapted to work with express

export interface WSRequest extends express.Request {
  ws: () => Promise<ws>;
}

export const WSUpgrade = (
  wsOptions?: ws.ServerOptions,
  wss: ws.Server = new ws.Server({ ...wsOptions, noServer: !0 }),
): (req: WSRequest, _: express.Response, next: express.NextFunction) => Promise<void> =>
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
