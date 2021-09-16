import { config } from 'dotenv';
import path from 'path';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { name, version } = require('@pack');

// init .env
config();

const NODE_ENV: string = process.env.NODE_ENV || 'development';
const PORT: number = +process.env.SERVICE_PORT || 1234;
const CORS_ALLOWED: string[] = process.env.CORS_ALLOWED?.split(/[\s,]+/) || [];

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
  name as NAME,
  version as VERSION,
};
