import { CronJob } from 'cron';
import { requestCollection, scheduleCollection } from '../db/handlers/index.js';
import { schedulerLogger } from '../logger.js';
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
            schedulerLogger.info('These requests has been dropped from requests collection', removedRequests.deletedCount);
        }
    }
    catch (error) {
        schedulerLogger.error('error', error);
    }
};
// job runs every hour
const job = new CronJob('0 0 * * * *', removeOutdatedAppointments, null, false, 'Europe/Berlin');
export default job;
//# sourceMappingURL=removeOutdatedAppointments.js.map