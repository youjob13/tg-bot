import * as Mongo from 'mongodb';

import type * as DTO from '../../../dto/index.js';
import * as Config from '../../config.js';
import { mongoLogger } from '../../logger.js';
import { dbPromise } from '../mongo.js';

class RequesterCollection {
    private collection: Mongo.Collection<Mongo.BSON.Document>;

    constructor(dbPromise: Promise<Mongo.Db>) {
        dbPromise.then(async db => {
            this.collection = await db.collection(Config.MONGO_DB.COLLECTION.REQUESTERS);
        });
    }

    public async getRequesterInfo(chatId: DTO.IRequesterInfo['chatId']) {
        try {
            return await this.collection.findOne<DTO.IRequesterInfo>({ chatId });
        } catch (error) {
            mongoLogger.error(error);
        }
    }

    public async getRequesterInfoByRequestId(requestId: DTO.IRequesterInfo['data'][0]['requestId']) {
        try {
            return await this.collection.findOne<DTO.IRequesterInfo>({ 'data.requestId': requestId });
        } catch (error) {
            mongoLogger.error(error);
        }
    }

    public async upsertRequesterInfo(
        chatId: DTO.IRequesterInfo['chatId'],
        requesterInfoData: DTO.IRequesterInfo['data'][0],
    ) {
        try {
            return await this.collection.updateOne(
                { chatId },
                { $push: { data: requesterInfoData } },
                { upsert: true },
            );
        } catch (error) {
            mongoLogger.error(error);
        }
    }

    public async approveUserRequest(chatId: DTO.IRequesterInfo['chatId'], requestId: string) {
        try {
            return await this.collection.findOneAndUpdate(
                { chatId, 'data.requestId': requestId },
                { $set: { 'data.$.isApproved': true } },
            );
        } catch (error) {
            mongoLogger.error(error);
        }
    }
}

export const requesterCollection = new RequesterCollection(dbPromise);
