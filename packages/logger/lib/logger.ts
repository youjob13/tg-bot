import * as Config from '@ann-nails/config';
import * as Logger from 'bunyan';

const logger = Logger.createLogger({
    name: 'API',
    appName: Config.LOGGER_OPTIONS.APP_NAME,
    level: Config.LOGGER_OPTIONS.LEVEL,
});

export const botLogger = logger.child({ module: 'tg-bot' });
export const apiLogger = logger.child({ module: 'api-server' });
export const schedulerLogger = logger.child({ module: 'scheduler-server' });
export const mongoLogger = logger.child({ module: 'mongodb' });
