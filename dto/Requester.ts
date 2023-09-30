import { ServiceOption } from './service.js';

export interface IRequesterInfo {
    chatId: number;
    // todo: isApproved should be false by default
    data: { serviceType: ServiceOption; date: string; isApproved?: boolean }[];
}
