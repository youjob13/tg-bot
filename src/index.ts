import { run } from '@grammyjs/runner';

import bot from './bot/bot.js';
import * as Config from './config.js';
import { runMongo } from './db/mongo.js';
import { apiLogger, botLogger } from './logger.js';
import server from './server/server.js';

server.listen(Config.PORT, async () => {
    try {
        apiLogger.info('Server listening on port', Config.PORT);

        await runMongo().then(() => {
            apiLogger.info('MongoDB connected');
        });

        const handler = run(bot);
        botLogger.info('Bot started?', handler.isRunning());
    } catch (err) {
        apiLogger.error(err);
    }
});
