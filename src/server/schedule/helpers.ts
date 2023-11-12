import { IRequestCollection } from '../../db/handlers/request';
import { IScheduleCollection } from '../../db/handlers/schedule';

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
