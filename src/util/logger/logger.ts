import { NAME, NODE_ENV } from '@config/environment';
import { LFService, Logger, LoggerFactoryOptions, LogGroupRule, LogLevel } from 'typescript-logging';

const logLevel = (NODE_ENV === 'production') ? LogLevel.Info : LogLevel.Trace;
const options = new LoggerFactoryOptions()
  .addLogGroupRule(new LogGroupRule(new RegExp('.+'), logLevel));

export const LogFactory = LFService.createNamedLoggerFactory('ServiceLogger', options);
export const LOG = LogFactory.getLogger(NAME);

export { Logger };
