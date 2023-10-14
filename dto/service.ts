import * as MongoDB from 'mongodb';

export interface IService {
    _id: MongoDB.ObjectId;
    key: string;
    name: string;
}
