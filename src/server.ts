// avoid problems with nodemon
if (process.env.NODEMON !== 'development') {
  require('module-alias/register');
}

import App from '@app/app';
import { NAME, PORT } from '@config/environment';

process.title = NAME;

App.start(PORT);
