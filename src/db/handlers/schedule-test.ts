import * as Mongo from 'mongodb';

import type * as DTO from '../../../dto/index.js';
import * as Config from '../../config.js';
import { dbPromise } from '../mongo.js';

class ScheduleTestCollection {
    private collection: Mongo.Collection<Mongo.BSON.Document>;

    constructor(dbPromise: Promise<Mongo.Db>) {
        dbPromise.then(async db => {
            this.collection = await db.collection(Config.MONGO_DB.COLLECTION.SCHEDULE_TEST);
        });
    }

    public async getDates() {
        return await this.collection.find<DTO.ISchedule>({}).toArray();
    }

    public async getBookedDates() {
        return await this.collection.find<DTO.ISchedule>({ isBooked: true }).toArray();
    }

    public async getAvailableDates() {
        return await this.collection.find<DTO.ISchedule>({ isBooked: { $ne: true } }).toArray();
    }

    public async insertDates(dates: DTO.ISchedule[]) {
        return await this.collection.insertMany(dates);
    }

    public async removeDates(dates: DTO.ISchedule[]) {
        return await this.collection.bulkWrite(
            dates.map(date => ({ deleteOne: { filter: { timestamp: date.timestamp } } })),
        );
    }
}

export const scheduleTestCollection = new ScheduleTestCollection(dbPromise);
