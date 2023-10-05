import { formatToDate } from '../../../shared/utils.js';
import { getUserFullName, getUsernameLink } from '../../helpers.js';
import { InlineQuery, ServiceByOption, createInlineKeyboard } from '../../keyboards/index.js';
const createDataForRequestInlineQuery = (inlineQuery, ctx, request) => {
    const uniqueRequestId = generateUniqueRequestId(request.date, request.serviceType);
    const data = `${inlineQuery}|${ctx.message.from.id}|${uniqueRequestId}`.trim();
    return data;
};
export const generateRequestFromUser = ({ ctx, request }) => {
    const user = ctx.message.from;
    const userFullName = getUserFullName(user);
    const usernameLink = getUsernameLink(user.username, userFullName);
    const readableServiceType = ServiceByOption[request.serviceType];
    const content = `
    <b>Новый запрос на запись</b>

Имя пользователя в телеграм: ${userFullName}
Телеграм username: ${usernameLink}
Введенная пользователем информация: ${ctx.message.text}
Услуга: ${readableServiceType}
Дата: ${formatToDate(request.date)}`;
    const inlineKeyboard = createInlineKeyboard([
        [`Подтвердить запись`, createDataForRequestInlineQuery(InlineQuery.ApproveNewRequest, ctx, request)],
        [`Отклонить запись`, createDataForRequestInlineQuery(InlineQuery.RejectNewRequest, ctx, request)],
    ]);
    const options = {
        parse_mode: 'HTML',
        reply_markup: inlineKeyboard,
    };
    return {
        content,
        options,
    };
};
export const extractServiceTypeFromQuery = (ctx, map) => {
    const data = ctx.callbackQuery?.data?.split(':')[1];
    const mappedData = map[data];
    return { value: data, displayName: mappedData };
};
export const generateUniqueRequestId = (date, serviceType) => {
    return `${date}_${serviceType}`;
};
//# sourceMappingURL=helpers.js.map