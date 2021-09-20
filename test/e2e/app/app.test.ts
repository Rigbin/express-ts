import { Request, Response } from 'express';
import { RoutingErrorHandler } from '../../../src/app/middleware/error';
import { CONTENT_TYPES } from '../../../src/config/constants';
import { NAME, VERSION } from '../../../src/config/environment';
import { TestApp, TestResponse } from '../e2e-setup';

describe('express app testing', () => {
  describe('routing tests', () => {
    it('should response 200 and Version-Info on GET /', async () => {
      const response: TestResponse = await TestApp.get('/');

      expect(response.status).toBe(200);
      expect(response.text).toBe(`You are on ${NAME} in version '${VERSION}'`);
    });

    it('should response info object on GET / with "Accept: application/json"', async () => {
      const response: TestResponse = await TestApp.get('/').set({ accept: CONTENT_TYPES.JSON });

      expect(response.headers['content-type']).toMatch(/application\/json/);
      expect(response.body).toMatchObject({
        name: NAME,
        version: VERSION,
        method: 'GET',
      });
    });

    it('should response 404 on unset GET', async () => {
      const response: TestResponse = await TestApp.get('/unknown');

      expect(response.status).toBe(404);
      expect(response.text).toBe('404 - page not found');
    });

    test.each([
      { method: 'POST', url: '/' },
      { method: 'PUT', url: '/' },
      { method: 'DELETE', url: '/' },
      { method: 'PATCH', url: '/' },
      { method: 'OPTIONS', url: '/' },
      { method: 'TRACE', url: '/' },
    ])('should response 501 on %s', async ({ method, url }) => {
      const response: TestResponse = await TestApp[<'post' | 'put' | 'delete' | 'patch' | 'options' | 'trace'>method.toLowerCase()](url);

      expect(response.status).toBe(501);
      expect(response.text).toMatch(/not implemented/);
    });

    it('should response 500 on error', async () => {
      const response: TestResponse = await TestApp.get('/errortest');

      expect(response.status).toBe(500);
    });
  });

  describe('routing error tests', () => {
    let req: Request;
    let res: Response;
    const next = jest.fn();
    const statusMock = jest.fn();
    const sendMock = jest.fn();

    beforeEach(() => {
      req = {} as Request;
      res = {
        status: statusMock,
        send: sendMock,
      } as unknown as Response;
      next.mockClear();
    });

    test('should handle error', () => {
      statusMock.mockImplementation((status) => {
        expect(status).toBe(500);
        return res;
      });

      RoutingErrorHandler(new Error('testerror'), req, res, next);
      expect(next).toBeCalledTimes(0);
    });
  });
});

