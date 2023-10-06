export interface ISchedule {
    uniqueId: string | null;
    timestamp: number;
    isBooked?: boolean;
    isNotified?: boolean;
}
