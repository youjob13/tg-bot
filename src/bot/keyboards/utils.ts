import { InlineKeyboard } from 'grammy';

import { InlineQuery } from './constants';
import { KeyboardData } from './models';

export const createInlineKeyboard = (labelDataPairs: Array<Array<string>>, withNewRows = true) => {
    return labelDataPairs.reduce(
        (keyboard, [label, data]) =>
            withNewRows === true ? keyboard.text(label, data).row() : keyboard.text(label, data),
        new InlineKeyboard(),
    );
};

export const makeInlineQueriesWithOptions = <TOption extends string>(
    serviceByOption: Record<TOption, string>,
    inlineQuery: InlineQuery,
) => {
    return Object.entries<string>(serviceByOption).reduce<KeyboardData>((acc, [option, service]) => {
        acc.push([service, `${inlineQuery}:${option}` as InlineQuery]);
        return acc;
    }, []);
};
