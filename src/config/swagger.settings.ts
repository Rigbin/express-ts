import { PATHS, PROJECT_NAME, PROJECT_VERSION, SWAGGER_DESCRIPTION, SWAGGER_LICENSE } from '@config/environment';
import { Options } from 'express-jsdoc-swagger';


/**
 * Checkout [express-jsdoc-swagger]{@link https://brikev.github.io/express-jsdoc-swagger-docs/#/configuration?id=configuration}
 * for details
 */
export const swaggerSettings: Options = {
  info: {
    version: PROJECT_VERSION,
    title: PROJECT_NAME,
    description: SWAGGER_DESCRIPTION,
    license: {
      name: SWAGGER_LICENSE,
    },
  },
  baseDir: PATHS.APP_ROOT,
  filesPattern: './**/*.ts',
  swaggerUIPath: '/api-docs',
  exposeSwaggerUI: true,
  exposeApiDocs: false,
  apiDocsPath: '/v1/api-docs',
  notRequiredAsNullable: true,
  swaggerUiOptions: {},
};

