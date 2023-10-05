import dayjs from 'dayjs';
export const formatToDate = (timestamp) => {
    return dayjs(timestamp).format('YYYY-MM-DD HH:mm');
};
export const formatToTimestamp = (date) => {
    return +new Date(date);
};
export const getNonNullableValues = (array) => {
    return array.filter(v => v != null);
};
//# sourceMappingURL=utils.js.map