import * as Mongo from 'mongodb';

import type * as DTO from '../../../dto/index.js';
import * as Config from '../../config.js';
import { dbPromise } from '../mongo.js';

class ScheduleCollection {
    private collection: Mongo.Collection<Mongo.BSON.Document>;

    constructor(dbPromise: Promise<Mongo.Db>) {
        dbPromise.then(async db => {
            this.collection = await db.collection(Config.MONGO_DB.COLLECTION.SCHEDULE);
        });
    }

    public async getDates() {
        return await this.collection.find<DTO.ISchedule>({}).toArray();
    }

    public async setDates(dates: DTO.ISchedule[]) {
        return await this.collection.insertMany(dates);
    }

    public async removeOutdatedDates() {
        return await this.collection.deleteMany({ timestamp: { $lt: Date.now() } });
    }

    public async getAvailableDates() {
        return await this.collection
            .find<{ timestamp: DTO.ISchedule['timestamp'] }>(
                { isBooked: { $ne: true }, timestamp: { $gte: Date.now() } },
                { projection: { timestamp: 1 } },
            )
            .map(({ timestamp }) => timestamp)
            .toArray();
    }

    public async getBookedNotNotifiedDates() {
        return await this.collection
            .find<{ timestamp: DTO.ISchedule['timestamp']; uniqueId: DTO.ISchedule['uniqueId'] }>(
                { isBooked: true, isNotified: { $ne: true } },
                { projection: { timestamp: 1, uniqueId: 1 } },
            )
            .toArray();
    }

    public async bookDate(timestamp: DTO.ISchedule['timestamp'], uniqueId: DTO.ISchedule['uniqueId']) {
        await this.collection.updateOne({ timestamp }, { $set: { isBooked: true, uniqueId } });
    }

    public async unBookDate(timestamp: DTO.ISchedule['timestamp']) {
        await this.collection.updateOne({ timestamp }, { $set: { isBooked: false, uniqueId: undefined } });
    }

    public async markDateIsNotified(uniqueId: DTO.ISchedule['uniqueId']) {
        await this.collection.updateOne({ uniqueId }, { $set: { isNotified: true } });
    }
}

export const scheduleCollection = new ScheduleCollection(dbPromise);
