import * as Config from '@ann-nails/config';
import { requestCollection, scheduleCollection } from '@ann-nails/db';
import { schedulerLogger } from '@ann-nails/logger';
import { CronJob } from 'cron';

const removeOutdatedAppointments = async () => {
    try {
        const [removedDates, removedRequests] = await Promise.all([
            scheduleCollection.removeOutdatedDates(),
            requestCollection.removeOutdatedRequests(),
        ]);
        if (removedDates.deletedCount > 0) {
            schedulerLogger.info('These dates has been dropped from schedule collection', removedDates.deletedCount);
        }

        if (removedRequests.deletedCount > 0) {
            schedulerLogger.info(
                'These requests has been dropped from requests collection',
                removedRequests.deletedCount,
            );
        }
    } catch (error) {
        schedulerLogger.error('error', error);
    }
};

// job runs every hour
const job = new CronJob('0 0 * * * *', removeOutdatedAppointments, null, false, Config.TZ);

export default job;
