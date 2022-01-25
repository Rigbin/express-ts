import { config } from 'dotenv';
import path from 'path';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { description, license, name, version } = require('@pack');

// init .env
config();

const NODE_ENV: string = process.env.NODE_ENV || 'development';
const PORT: number = parseInt(process.env.SERVICE_PORT || '1234');
/** Allow CORS for individual URLs via custom config. Checkout {@link https://github.com/Rigbin/express-ts#configuration README} */
const CORS_ALLOWED: string[] = process.env.CORS_ALLOWED?.split(/[\s,]+/) || [];

const SWAGGER_LICENSE: string = process.env.SWAGGER_LICENSE || license;
const SWAGGER_DESCRIPTION: string = process.env.SWAGGER_DESCRIPTION || description;

const APP_ROOT = path.join(__dirname, '..');

const PATHS = {
  APP_ROOT,
  ASSETS: path.join(APP_ROOT, 'assets'),
  PUBLIC: path.join(APP_ROOT, 'public'),
};

export {
  CORS_ALLOWED,
  NODE_ENV,
  PORT,
  PATHS,

  name as PROJECT_NAME,
  version as PROJECT_VERSION,

  SWAGGER_DESCRIPTION,
  SWAGGER_LICENSE,
};
