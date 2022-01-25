import { LICENSE, NAME, PATHS, VERSION } from '@config/environment';
import { Options } from 'express-jsdoc-swagger';

export const swaggerSettings: Options = {
  info: {
    version: VERSION,
    title: NAME,
    license: {
      name: LICENSE,
    },
  },
  baseDir: PATHS.APP_ROOT,
  filesPattern: './app/routes/**/*.router.ts',
  swaggerUIPath: '/api-docs',
  exposeSwaggerUI: true,
  exposeApiDocs: false,
  apiDocsPath: '/v1/api-docs',
  notRequiredAsNullable: true,
  swaggerUiOptions: {},
};

