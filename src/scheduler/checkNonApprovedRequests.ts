import { CronJob } from 'cron';

import bot from '../bot/bot.js';
import { ADMIN_ID, ADMIN_ID_2 } from '../bot/commands/constants.js';
import { generatePartialRequestFromUser } from '../bot/commands/helpers.js';
import * as Config from '../config.js';
import { requestCollection, servicesCollection } from '../db/handlers/index.js';
import { schedulerLogger } from '../logger.js';

const FIVE_MINUTES = 5 * 60 * 1000;

const checkNonApprovedRequests = async () => {
    try {
        const nonApprovedRequests = (await requestCollection.getNonApprovedRequestsWithoutUserCustomData()).filter(
            request => {
                const now = Date.now();
                return now - request._timestamp > FIVE_MINUTES;
            },
        );

        if (nonApprovedRequests.length === 0) {
            return;
        }

        for (const nonApprovedRequest of nonApprovedRequests) {
            const selectedService = await servicesCollection.getService(nonApprovedRequest.serviceType);
            const { content, options } = generatePartialRequestFromUser({
                request: nonApprovedRequest,
                selectedService,
            });

            const adminNotificationPromise = bot.api.sendMessage(ADMIN_ID_2, content, options);
            const adminNotificationPromise2 = bot.api.sendMessage(ADMIN_ID, content, options);
            const markPartialRequestAsNotifiedPromise = requestCollection.markPartialRequestAsNotified(
                nonApprovedRequest.date,
            );

            await Promise.all([
                adminNotificationPromise,
                adminNotificationPromise2,
                markPartialRequestAsNotifiedPromise,
            ]);
        }
    } catch (error) {
        schedulerLogger.error('error', error);
    }
};

const job = new CronJob('0 0 * * * *', checkNonApprovedRequests, null, false, Config.TZ);

export default job;
