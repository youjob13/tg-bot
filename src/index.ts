import { bot } from '@ann-nails/bot';
import * as Config from '@ann-nails/config';
import { runMongo } from '@ann-nails/db';
import { apiLogger, botLogger, mongoLogger, schedulerLogger } from '@ann-nails/logger';
import { checkNonApprovedRequests, notification, removeOutdatedAppointments } from '@ann-nails/scheduler';

import { run } from '@grammyjs/runner';

import server from './server/server.js';

server.listen(Config.PORT, async () => {
    try {
        apiLogger.info('Server listening on port', Config.PORT);

        await runMongo().then(() => {
            mongoLogger.info('MongoDB connected');
        });

        const handler = run(bot);
        botLogger.info('Bot started?', handler.isRunning());

        notification.start();
        schedulerLogger.info('Push notifications Job is activated');

        removeOutdatedAppointments.start();
        schedulerLogger.info('Remove outdated appointments Job is activated');

        checkNonApprovedRequests.start();
        schedulerLogger.info('Check non approved requests Job is activated');
    } catch (err) {
        apiLogger.error(err);
    }
});
