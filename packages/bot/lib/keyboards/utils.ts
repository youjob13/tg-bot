import { InlineKeyboard } from 'grammy';

import { InlineQuery } from './constants.js';
import { KeyboardData } from './models.js';

export const createInlineKeyboard = (labelDataPairs: Array<Array<string>>, withNewRows = true) => {
    return labelDataPairs.reduce(
        (keyboard, [label, data]) =>
            withNewRows === true ? keyboard.text(label, data).row() : keyboard.text(label, data),
        new InlineKeyboard(),
    );
};
export const makeInlineQueriesWithOptions = <T extends Record<'key' | 'name', string>[]>(
    serviceList: T,
    inlineQuery: InlineQuery,
) => {
    return serviceList.reduce<KeyboardData>((acc, { key, name }) => {
        acc.push([name, `${inlineQuery}:${key}` as InlineQuery]);
        return acc;
    }, []);
};
