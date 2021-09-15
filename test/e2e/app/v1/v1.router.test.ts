import { TestApp, TestResponse } from '../../e2e-setup';

const PATH = '/v1';

describe('ROUTE: /v1 testing', () => {
  test.each([
    ['*/*'],
    ['text/plain'],
    ['application/json'],
  ])('GET / %s', async (contentType: string) => {
    const response: TestResponse = await TestApp.get(PATH).set({ accept: contentType });

    const textResponse = 'API V1';
    const jsonResponse = { api: 'V1' };

    expect(response.status).toBe(200);
    if (contentType !== 'application/json') {
      expect(response.text).toBe(textResponse);
    } else {
      expect(response.body).toMatchObject(jsonResponse);
    }
  });
  test.each([
    ['text/html'],
    ['application/xhtml+xml'],
    ['application/xml'],
    ['image/avif'],
    ['image/webp'],
    ['image/apng'],
  ])('GET / %s', async (contentType: string) => {
    const response: TestResponse = await TestApp.get(PATH).set({ accept: contentType });

    expect(response.status).toBe(406);
    expect(response.text).toBe(`${contentType} not supported`);
  });
});
