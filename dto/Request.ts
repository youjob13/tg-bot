import { IService } from './service.js';

export enum RequestState {
    InProgress = 'in_progress',
    PendingApproval = 'pending_approval',
    Approved = 'approved',
    Rejected = 'rejected',
}

export interface IRequest {
    _timestamp?: number;
    chatId: number;
    serviceType: IService['key'];
    date: number;
    isApproved: boolean;
    isNotifiedAboutPartialRequest?: boolean;
    requestId: string;
    username: string | undefined;
    userFullName: string;
    userCustomData?: string;
}
