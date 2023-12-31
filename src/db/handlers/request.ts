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

    public async getLatestRequestByChatId(chatId: DTO.IRequest['chatId']) {
        try {
            return await this.collection.findOne<DTO.IRequest>({ chatId }, { sort: { _timestamp: -1 } });
        } catch (error) {
            mongoLogger.error(error);
        }
    }

    public async getRequestByChatIdAndRequestId(chatId: DTO.IRequest['chatId'], requestId: DTO.IRequest['requestId']) {
        try {
            return await this.collection.findOneAndDelete({ chatId, requestId });
        } catch (error) {
            mongoLogger.error(error);
        }
    }

    public async getApprovedRequestByChatIdAndRequestId(
        chatId: DTO.IRequest['chatId'],
        requestId: DTO.IRequest['requestId'],
    ) {
        try {
            return await this.collection.findOne<DTO.IRequest>({ chatId, requestId, isApproved: true });
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

    public async insertUserCustomDataToRequest({
        chatId,
        requestId,
        userCustomData,
    }: {
        chatId: DTO.IRequest['chatId'];
        requestId: DTO.IRequest['requestId'];
        userCustomData: DTO.IRequest['userCustomData'];
    }) {
        try {
            return await this.collection.findOneAndUpdate({ chatId, requestId }, { $set: { userCustomData } });
        } catch (error) {
            mongoLogger.error(error);
        }
    }

    public async approveUserRequest(chatId: DTO.IRequest['chatId'], requestId: string) {
        try {
            return await this.collection.findOneAndUpdate({ chatId, requestId }, { $set: { isApproved: true } });
        } catch (error) {
            mongoLogger.error(error);
        }
    }
}

export const requestCollection = new RequestCollection(dbPromise);
