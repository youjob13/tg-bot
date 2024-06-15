import * as Bot from '@ann-nails/bot';
import * as Config from '@ann-nails/config';
import { requestCollection, servicesCollection } from '@ann-nails/db';
import { schedulerLogger } from '@ann-nails/logger';
import { CronJob } from 'cron';

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
            const { content, options } = Bot.generatePartialRequestFromUser({
                request: nonApprovedRequest,
                selectedService,
            });

            const adminNotificationPromise = Bot.bot.api.sendMessage(Config.ADMIN_ID_2, content, options);
            const adminNotificationPromise2 = Bot.bot.api.sendMessage(Config.ADMIN_ID, content, options);
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
