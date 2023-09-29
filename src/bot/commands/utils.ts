import type { Context } from 'grammy';

export const extractDataFromQuery = (ctx: Context) => {
    const data = ctx.callbackQuery?.data?.split(':')[1];
    return data;
};

export const extractMappedDataFromQuery = <TMap>(ctx: Context, map: TMap) => {
    const data = extractDataFromQuery(ctx);
    const mappedData = map[data as keyof typeof map];
    return { value: data, displayName: mappedData };
};
