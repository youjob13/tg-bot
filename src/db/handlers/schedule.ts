import * as Mongo from 'mongodb';

import type * as DTO from '../../../dto/Schedule.js';
import * as Config from '../../config.js';
import { dbPromise } from '../mongo.js';

class ScheduleCollection {
    private collection: Mongo.Collection<Mongo.BSON.Document>;

    constructor(dbPromise: Promise<Mongo.Db>) {
        dbPromise.then(async db => {
            this.collection = await db.collection(Config.MONGO_DB.COLLECTION.SCHEDULE);
        });
    }

    public async getAvailableDates() {
        return await this.collection
            .find<{ timestamp: DTO.ISchedule['timestamp'] }>({ isAvailable: true }, { projection: { timestamp: 1 } })
            .map(({ timestamp }) => timestamp)
            .toArray();
    }

    public async bookDate(timestamp: DTO.ISchedule['timestamp']) {
        await this.collection.updateOne({ timestamp }, { $set: { isAvailable: false } });
    }
}

export const scheduleCollection = new ScheduleCollection(dbPromise);
