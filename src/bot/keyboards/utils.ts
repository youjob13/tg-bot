import { InlineKeyboard } from 'grammy';

export const createInlineKeyboard = (labelDataPairs: Array<Array<string>>, withNewRows = true) => {
    return labelDataPairs.reduce(
        (keyboard, [label, data]) =>
            withNewRows === true ? keyboard.text(label, data).row() : keyboard.text(label, data),
        new InlineKeyboard(),
    );
};

export const makeInlineQueriesWithOptions = <TOption extends string, TQuery = string>(
    serviceByOption: Record<TOption, string>,
    inlineQuery: TQuery,
) => {
    return Object.entries<string>(serviceByOption).reduce<Array<Array<string>>>((acc, [option, service]) => {
        acc.push([service, `${inlineQuery}:${option}`]);
        return acc;
    }, []);
};
