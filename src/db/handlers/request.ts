import * as Mongo from 'mongodb';

import type * as DTO from '../../../dto/index.js';
import * as Config from '../../config.js';
import { mongoLogger } from '../../logger.js';
import { dbPromise } from '../mongo.js';

class RequestCollection {
    private collection: Mongo.Collection<Mongo.BSON.Document>;

    constructor(dbPromise: Promise<Mongo.Db>) {
        dbPromise.then(async db => {
            this.collection = await db.collection(Config.MONGO_DB.COLLECTION.REQUESTS);
        });
    }

    public async removeOutdatedRequests() {
        return await this.collection.deleteMany({ date: { $lt: Date.now() } });
    }

    public async removeRequest(date: DTO.IRequest['date']) {
        return await this.collection.deleteOne({ date });
    }

    public async getCustomersByDates(dates: DTO.IRequest['date'][]) {
        try {
            return await this.collection.find({ date: { $in: dates } }, { sort: { _timestamp: -1 } }).toArray();
        } catch (error) {
            mongoLogger.error(error);
        }
    }

    public async getLatestRequestByChatId(chatId: DTO.IRequest['chatId']) {
        try {
            return await this.collection.findOne<DTO.IRequest>({ chatId }, { sort: { _timestamp: -1 } });
        } catch (error) {
            mongoLogger.error(error);
        }
    }

    public async getRequestsByChatId(chatId: DTO.IRequest['chatId']) {
        try {
            return await this.collection.find<DTO.IRequest>({ chatId }, { sort: { _timestamp: -1 } }).toArray();
        } catch (error) {
            mongoLogger.error(error);
        }
    }

    public async getRequestByDate(date: DTO.IRequest['date']) {
        try {
            return await this.collection.findOneAndDelete({ date });
        } catch (error) {
            mongoLogger.error(error);
        }
    }

    public async getApprovedRequestByDate(date: DTO.IRequest['date']) {
        try {
            return await this.collection.findOne<DTO.IRequest>({ date, isApproved: true });
        } catch (error) {
            mongoLogger.error(error);
        }
    }

    public async createRequest(requestData: DTO.IRequest) {
        try {
            return await this.collection.insertOne({ ...requestData, _timestamp: Date.now() });
        } catch (error) {
            mongoLogger.error(error);
        }
    }

    public async getNonApprovedRequestsWithoutUserCustomData() {
        return await this.collection
            .find<DTO.IRequest>({
                isApproved: false,
                userCustomData: { $exists: false },
                isNotifiedAboutPartialRequest: { $ne: true },
                date: { $gte: Date.now() },
            })
            .toArray();
    }

    public async markPartialRequestAsNotified(date: DTO.IRequest['date']) {
        return await this.collection.updateOne({ date }, { $set: { isNotifiedAboutPartialRequest: true } });
    }

    public async insertUserCustomDataToRequest({
        date,
        userCustomData,
    }: {
        date: DTO.IRequest['date'];
        userCustomData: DTO.IRequest['userCustomData'];
    }) {
        try {
            return await this.collection.findOneAndUpdate({ date }, { $set: { userCustomData } });
        } catch (error) {
            mongoLogger.error(error);
        }
    }

    public async approveUserRequest(date: DTO.IRequest['date']) {
        try {
            return await this.collection.findOneAndUpdate({ date }, { $set: { isApproved: true } });
        } catch (error) {
            mongoLogger.error(error);
        }
    }

    public async upsertApprovedUserRequest(updatedRequest: DTO.IUpdatedRequest) {
        const { updatedDate, ...other } = updatedRequest;
        const requestToUpdate = { ...other, date: updatedDate };
        try {
            return await this.collection.findOneAndUpdate(
                { date: requestToUpdate.date },
                { $set: { ...requestToUpdate, isApproved: true } },
                { upsert: true },
            );
        } catch (error) {
            mongoLogger.error(error);
        }
    }
}

export type IRequestCollection = RequestCollection;
export const requestCollection = new RequestCollection(dbPromise);
