import * as Mongo from 'mongodb';

import type * as DTO from '../../../dto/index.js';
import * as Config from '../../config.js';
import { dbPromise } from '../mongo.js';

class ServicesCollection {
    private collection: Mongo.Collection<Mongo.BSON.Document>;

    constructor(dbPromise: Promise<Mongo.Db>) {
        dbPromise.then(async db => {
            this.collection = await db.collection(Config.MONGO_DB.COLLECTION.SERVICES);
        });
    }

    public async getService(key: DTO.IService['key']) {
        return await this.collection.findOne<DTO.IService>({ key });
    }

    public async getServices() {
        return await this.collection.find<DTO.IService>({}).toArray();
    }

    public async updateServices(services: DTO.IService[]) {
        const promises = Promise.all(
            services.map(service => {
                return this.collection.updateOne(
                    { key: service.key },
                    { $set: { key: service.key, name: service.name } },
                    { upsert: true },
                );
            }),
        );
        return await promises;
    }

    public async removeServices(services: DTO.IService[]) {
        const promises = Promise.all(services.map(service => this.collection.deleteOne({ key: service.key })));
        return await promises;
    }
}

export const servicesCollection = new ServicesCollection(dbPromise);
