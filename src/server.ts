// avoid problems with nodemon
if (process.env.NODEMON !== 'development') {
  require('module-alias/register');
}

import App from '@app/app';
import { PROJECT_NAME, PORT } from '@config/environment';

process.title = PROJECT_NAME;

App.start(PORT);
