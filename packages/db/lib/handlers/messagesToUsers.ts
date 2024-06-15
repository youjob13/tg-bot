import * as Config from '@ann-nails/config';
import type * as DTO from '@ann-nails/dto';
import * as Mongo from 'mongodb';

import { dbPromise } from '../mongo.js';

class MessagesToUsersCollection {
    private collection: Mongo.Collection<Mongo.BSON.Document>;

    constructor(dbPromise: Promise<Mongo.Db>) {
        dbPromise.then(async db => {
            this.collection = await db.collection(Config.MONGO_DB.COLLECTION.MESSAGES_TO_USERS);
        });
    }

    public async getLocation(key: DTO.IMessagesToUsers['key']) {
        return await this.collection.findOne<DTO.IMessagesToUsers>({ key });
    }

    public async updateLocation(location: DTO.IMessagesToUsers) {
        return this.collection.updateOne(
            { key: location.key },
            { $set: { key: location.key, value: location.value } },
            { upsert: true },
        );
    }
}

export const messagesToUsersCollection = new MessagesToUsersCollection(dbPromise);
