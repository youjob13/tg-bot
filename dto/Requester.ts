import type { ServiceOption } from './service.js';

export interface IRequesterInfo {
    chatId: number;
    data: {
        serviceType: ServiceOption;
        date: number;
        isApproved: boolean;
        requestId: string;
        username: string | undefined;
        userFullName: string;
    }[];
}
