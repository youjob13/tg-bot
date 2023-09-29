import type { Context } from 'grammy';

export const extractDataFromQuery = <TData = string>(ctx: Context): TData => {
    const data = ctx.callbackQuery?.data?.split(':')[1];
    return data as TData;
};

export const extractMappedDataFromQuery = <T extends { TMap: any; TData: any }, TMap = T['TMap'], TData = T['TData']>(
    ctx: Context,
    map: TMap,
) => {
    const data = extractDataFromQuery<TData>(ctx);
    const mappedData = map[data as keyof typeof map];
    return { value: data, displayName: mappedData };
};
