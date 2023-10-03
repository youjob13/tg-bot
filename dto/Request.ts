import { ServiceOption } from './service';

export enum RequestState {
    InProgress = 'in_progress',
    PendingApproval = 'pending_approval',
    Approved = 'approved',
    Rejected = 'rejected',
}

export interface IRequest {
    chatId: number;
    serviceType: ServiceOption;
    date: number;
    isApproved: boolean;
    requestId: string;
    username: string | undefined;
    userFullName: string;
    userCustomData?: string;
}
