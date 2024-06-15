import * as Config from '@ann-nails/config';
import type * as DTO from '@ann-nails/dto';
import * as Mongo from 'mongodb';

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

    public async getBookedDate(date: DTO.ISchedule['timestamp']) {
        return await this.collection.findOne<DTO.ISchedule>({ timestamp: date, isBooked: true });
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
            .find<{ timestamp: DTO.ISchedule['timestamp'] }>(
                { isBooked: true, isNotified: { $ne: true } },
                { projection: { timestamp: 1 } },
            )
            .toArray();
    }

    public async bookDate(timestamp: DTO.ISchedule['timestamp']) {
        await this.collection.updateOne({ timestamp }, { $set: { isBooked: true } });
    }

    public async upsertBookedDate(timestamp: DTO.ISchedule['timestamp']) {
        await this.collection.updateOne(
            { timestamp },
            { $set: { isBooked: true, isNotified: false } },
            { upsert: true },
        );
    }

    public async unBookDate(timestamp: DTO.ISchedule['timestamp']) {
        await this.collection.updateOne({ timestamp }, { $set: { isBooked: false } });
    }

    public async markDateIsNotified(timestamp: DTO.ISchedule['timestamp']) {
        await this.collection.updateOne({ timestamp }, { $set: { isNotified: true } });
    }

    public async getBookedDates() {
        return await this.collection.find<DTO.ISchedule>({ isBooked: true }).toArray();
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

export type IScheduleCollection = ScheduleCollection;
export const scheduleCollection = new ScheduleCollection(dbPromise);
