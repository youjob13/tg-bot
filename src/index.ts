import { run } from '@grammyjs/runner';

import bot from '../packages/bot/lib/bot.js';
import * as Config from '../packages/config/lib/config.js';
import { runMongo } from '../packages/db/lib/mongo.js';
import { apiLogger, botLogger, mongoLogger, schedulerLogger } from '../packages/logger/lib/logger.js';
import checkNonApprovedRequestsJob from '../packages/scheduler/lib/checkNonApprovedRequests.js';
import notificationsJob from '../packages/scheduler/lib/notification.js';
import removeOutdatedAppointmentsJob from '../packages/scheduler/lib/removeOutdatedAppointments.js';
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

        checkNonApprovedRequestsJob.start();
        schedulerLogger.info('Check non approved requests Job is activated');
    } catch (err) {
        apiLogger.error(err);
    }
});
