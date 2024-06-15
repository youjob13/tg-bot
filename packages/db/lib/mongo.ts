import * as Config from '@ann-nails/config';
import { mongoLogger } from '@ann-nails/logger';
import * as Mongo from 'mongodb';

const uri = 'mongodb://root:example@172.22.48.1:27017/test';
// const uri = `mongodb+srv://${Config.MONGO_DB.USER}:${Config.MONGO_DB.PASS}@cluster-base.knd90rj.mongodb.net/?retryWrites=true&w=majority`;
const client = new Mongo.MongoClient(Config.MONGO_DB_CONNECTION_STRING, {
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
