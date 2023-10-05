import { InlineKeyboard } from 'grammy';
export const createInlineKeyboard = (labelDataPairs, withNewRows = true) => {
    return labelDataPairs.reduce((keyboard, [label, data]) => withNewRows === true ? keyboard.text(label, data).row() : keyboard.text(label, data), new InlineKeyboard());
};
export const makeInlineQueriesWithOptions = (serviceByOption, inlineQuery) => {
    return Object.entries(serviceByOption).reduce((acc, [option, service]) => {
        acc.push([service, `${inlineQuery}:${option}`]);
        return acc;
    }, []);
};
//# sourceMappingURL=utils.js.map