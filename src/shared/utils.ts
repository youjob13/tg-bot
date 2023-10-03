import dayjs from 'dayjs';

export const formatToDate = (timestamp: number) => {
    return dayjs(timestamp).format('YYYY-MM-DD HH:mm');
};

export const formatToTimestamp = (date: string) => {
    return +new Date(date);
};

export const getNonNullableValues = <T>(array: (T | null | undefined)[]): T[] => {
    return array.filter(v => v != null) as T[];
};
