import { run } from '@grammyjs/runner';

import bot from './bot/bot.js';
import * as Config from './config.js';
import { apiLogger, botLogger } from './logger.js';
import server from './server/server.js';

server.listen(Config.PORT, () => {
    apiLogger.info('Server listening on port', Config.PORT);

    run(bot);
    botLogger.info('Bot started');
});
