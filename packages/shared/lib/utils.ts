import * as Config from '@ann-nails/config';
import dayjs from 'dayjs';
import localeRU from 'dayjs/locale/ru.js';
import { DateTime } from 'luxon';

dayjs.locale(localeRU);

const capitalize = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const formatToDate = (timestamp: number | string) => {
    return capitalize(dayjs(timestamp).format('dd DD.MM.YYYY HH:mm'));
};

export const formatToTimestamp = (date: string) => {
    return +new Date(date);
};

export const formatStringDateToTimestamp = (date: string) => {
    return DateTime.fromFormat(date, 'yyyy-MM-dd HH:mm', { zone: Config.TZ }).toMillis();
};

export const getNonNullableValues = <T>(array: (T | null | undefined)[]): T[] => {
    return array.filter(v => v != null) as T[];
};
