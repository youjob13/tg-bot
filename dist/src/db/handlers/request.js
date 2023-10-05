import * as Config from '../../config.js';
import { mongoLogger } from '../../logger.js';
import { dbPromise } from '../mongo.js';
class RequestCollection {
    collection;
    constructor(dbPromise) {
        dbPromise.then(async (db) => {
            this.collection = await db.collection(Config.MONGO_DB.COLLECTION.REQUESTS);
        });
    }
    async removeOutdatedRequests() {
        return await this.collection.deleteMany({ date: { $lt: Date.now() } });
    }
    async getLatestRequestByChatId(chatId) {
        try {
            return await this.collection.findOne({ chatId }, { sort: { _timestamp: -1 } });
        }
        catch (error) {
            mongoLogger.error(error);
        }
    }
    async getRequestByChatIdAndRequestId(chatId, requestId) {
        try {
            return await this.collection.findOneAndDelete({ chatId, requestId });
        }
        catch (error) {
            mongoLogger.error(error);
        }
    }
    async getApprovedRequestByChatIdAndRequestId(chatId, requestId) {
        try {
            return await this.collection.findOne({ chatId, requestId, isApproved: true });
        }
        catch (error) {
            mongoLogger.error(error);
        }
    }
    async createRequest(requestData) {
        try {
            return await this.collection.insertOne({ ...requestData, _timestamp: Date.now() });
        }
        catch (error) {
            mongoLogger.error(error);
        }
    }
    async insertUserCustomDataToRequest({ chatId, requestId, userCustomData, }) {
        try {
            return await this.collection.findOneAndUpdate({ chatId, requestId }, { $set: { userCustomData } });
        }
        catch (error) {
            mongoLogger.error(error);
        }
    }
    async approveUserRequest(chatId, requestId) {
        try {
            return await this.collection.findOneAndUpdate({ chatId, requestId }, { $set: { isApproved: true } });
        }
        catch (error) {
            mongoLogger.error(error);
        }
    }
}
export const requestCollection = new RequestCollection(dbPromise);
//# sourceMappingURL=request.js.map