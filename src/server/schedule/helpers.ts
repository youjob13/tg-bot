import { IRequestCollection } from '../../../packages/db/lib/handlers/request';
import { IScheduleCollection } from '../../../packages/db/lib/handlers/schedule';

export const getBookedRequests = async ({
    scheduleCollection,
    requestCollection,
}: {
    scheduleCollection: IScheduleCollection;
    requestCollection: IRequestCollection;
}) => {
    const dates = await scheduleCollection.getBookedDates();
    const timestamps = dates.map(({ timestamp }) => timestamp);

    const bookedRequests = await requestCollection.getCustomersByDates(timestamps);
    return bookedRequests;
};
