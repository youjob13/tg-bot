import * as MongoDB from 'mongodb';

export type IService = {
    _id: MongoDB.ObjectId;
    key: string;
    name: string;
};
