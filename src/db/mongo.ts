import * as Mongo from 'mongodb';

import * as Config from '../config.js';
import { mongoLogger } from '../logger.js';

const uri = `mongodb+srv://${Config.MONGO_DB.USER}:${Config.MONGO_DB.PASS}@cluster-base.knd90rj.mongodb.net/?retryWrites=true&w=majority`;

const client = new Mongo.MongoClient(uri, {
    serverApi: {
        version: Mongo.ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

let resolveDataDB: (client: Mongo.Db) => void = () => void 0;
const databasePromise: Promise<Mongo.Db> = new Promise(resolve => {
    resolveDataDB = resolve;
});

async function run() {
    try {
        await client.connect();
        const db = await client.db(Config.MONGO_DB.NAME);
        resolveDataDB(db);
    } catch (err) {
        mongoLogger.error(err);
        await client.close();
    }
}

export { run as runMongo, client as mongoClient, databasePromise as dbPromise };
