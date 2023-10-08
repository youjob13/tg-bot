import { run } from '@grammyjs/runner';

import bot from './bot/bot.js';
import * as Config from './config.js';
import { runMongo } from './db/mongo.js';
import { apiLogger, botLogger, mongoLogger, schedulerLogger } from './logger.js';
import notificationsJob from './scheduler/notification.js';
import removeOutdatedAppointmentsJob from './scheduler/removeOutdatedAppointments.js';
import server from './server/server.js';

server.listen(Config.PORT, async () => {
    try {
        apiLogger.info('Server listening on port', Config.PORT);

        await runMongo().then(() => {
            mongoLogger.info('MongoDB connected');
        });

        const handler = run(bot);
        botLogger.info('Bot started?', handler.isRunning());

        notificationsJob.start();
        schedulerLogger.info('Push notifications Job is activated');

        removeOutdatedAppointmentsJob.start();
        schedulerLogger.info('Remove outdated appointments Job is activated');
    } catch (err) {
        apiLogger.error(err);
    }
});
