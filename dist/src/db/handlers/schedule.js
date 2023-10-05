import * as Config from '../../config.js';
import { dbPromise } from '../mongo.js';
class ScheduleCollection {
    collection;
    constructor(dbPromise) {
        dbPromise.then(async (db) => {
            this.collection = await db.collection(Config.MONGO_DB.COLLECTION.SCHEDULE);
        });
    }
    async removeOutdatedDates() {
        return await this.collection.deleteMany({ timestamp: { $lt: Date.now() } });
    }
    async getAvailableDates() {
        return await this.collection
            .find({ isBooked: { $ne: true }, timestamp: { $gte: Date.now() } }, { projection: { timestamp: 1 } })
            .map(({ timestamp }) => timestamp)
            .toArray();
    }
    async getBookedNotNotifiedDates() {
        return await this.collection
            .find({ isBooked: true, isNotified: { $ne: true } }, { projection: { timestamp: 1, uniqueId: 1 } })
            .toArray();
    }
    async bookDate(timestamp, uniqueId) {
        await this.collection.updateOne({ timestamp }, { $set: { isBooked: true, uniqueId } });
    }
    async unBookDate(timestamp) {
        await this.collection.updateOne({ timestamp }, { $set: { isBooked: false, uniqueId: undefined } });
    }
    async markDateIsNotified(uniqueId) {
        await this.collection.updateOne({ uniqueId }, { $set: { isNotified: true } });
    }
}
export const scheduleCollection = new ScheduleCollection(dbPromise);
//# sourceMappingURL=schedule.js.map