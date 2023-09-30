import { Context, RawApi } from 'grammy';
import { Other } from 'grammy/out/core/api';

import * as DTO from '../../../../dto/index.js';
import { getUserFullName, getUsernameLink } from '../../helpers.js';
import { InlineQuery, ServiceByOption, createInlineKeyboard } from '../../keyboards/index.js';

const createDataForRequestInlineQuery = (
    inlineQuery: InlineQuery.ApproveNewRequest | InlineQuery.RejectNewRequest,
    ctx: Context,
) => {
    const userFullName = getUserFullName(ctx.message.from);
    const username = ctx.message.from.username;
    const data = `${inlineQuery}:${ctx.message.from.id}:${userFullName}`.trim();
    return username != null ? `${data}:${username}` : data;
};

export const generateRequestFromUser = ({
    ctx,
    latestServiceInfo,
}: {
    ctx: Context;
    latestServiceInfo: DTO.IRequesterInfo['data'][0];
}) => {
    const user = ctx.message.from;
    const userFullName = getUserFullName(user);
    const usernameLink = getUsernameLink(user.username);
    const readableServiceType = ServiceByOption[latestServiceInfo.serviceType];

    const content = `
    <b>Новый запрос на запись</b>

Имя пользователя в телеграм: ${userFullName}
Телеграм username: ${usernameLink}
Введенная пользователем информация: ${ctx.message.text}
Услуга: ${readableServiceType}
Дата: ${latestServiceInfo.date}`;

    const inlineKeyboard = createInlineKeyboard([
        [`Подтвердить запись`, createDataForRequestInlineQuery(InlineQuery.ApproveNewRequest, ctx)],
        [`Отклонить запись`, createDataForRequestInlineQuery(InlineQuery.RejectNewRequest, ctx)],
    ]);

    const options: Other<RawApi, 'sendMessage', 'text' | 'chat_id'> = {
        parse_mode: 'HTML',
        reply_markup: inlineKeyboard,
    };

    return {
        content,
        options,
    };
};
export const extractServiceTypeFromQuery = (ctx: Context, map: typeof ServiceByOption) => {
    const data = ctx.callbackQuery?.data?.split(':')[1];
    const mappedData = map[data as keyof typeof map];
    return { value: data, displayName: mappedData };
};
