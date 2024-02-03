import { formatToDate } from '@youjob13/utils/packages/date-formatters';
import { Context, RawApi } from 'grammy';
import { Other } from 'grammy/out/core/api';

import * as DTO from '../../../dto/index.js';
import { servicesCollection } from '../../db/handlers/services.js';
import { getUserFullName, getUsernameLink } from '../helpers.js';
import { InlineQuery, createInlineKeyboard } from '../keyboards/index.js';

const createDataForRequestInlineQuery = (
    inlineQuery: InlineQuery.ApproveNewRequest | InlineQuery.RejectNewRequest,
    request: DTO.IRequest,
) => {
    const data = `${inlineQuery}|${request.date}`.trim();
    return data;
};

const createDataForPartialRequestInlineQuery = (
    inlineQuery: InlineQuery.ApproveNewRequest | InlineQuery.RejectNewRequest | InlineQuery.RejectPartialNewRequest,
    request: DTO.IRequest,
) => {
    const data = `${inlineQuery}|${request.date}`.trim();
    return data;
};

export const generateRequestFromUser = ({
    ctx,
    request,
    selectedService,
}: {
    ctx: Context;
    request: DTO.IRequest;
    selectedService: DTO.IService;
}) => {
    const user = ctx.message.from;
    const userFullName = getUserFullName(user);
    const usernameLink = getUsernameLink(user.username, userFullName);

    const content = `
    <b>Новый запрос на запись</b>

Имя пользователя в телеграм: ${userFullName}
Телеграм username: ${usernameLink}
Введенная пользователем информация: ${ctx.message.text}
Услуга: ${selectedService.name}
Дата: ${formatToDate(request.date)}`;

    const inlineKeyboard = createInlineKeyboard([
        [`Подтвердить запись`, createDataForRequestInlineQuery(InlineQuery.ApproveNewRequest, request)],
        [`Отклонить запись`, createDataForRequestInlineQuery(InlineQuery.RejectNewRequest, request)],
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
export const extractServiceTypeFromQuery = async (ctx: Context) => {
    const serviceType = ctx.callbackQuery?.data?.split(':')[1];
    const selectedService = await servicesCollection.getService(serviceType);
    return { value: selectedService.key, displayName: selectedService.name };
};
export const generatePartialRequestFromUser = ({
    request,
    selectedService,
}: {
    request: DTO.IRequest;
    selectedService: DTO.IService;
}) => {
    const usernameLink = getUsernameLink(request.username, request.userFullName);

    const content = `
    <b>Пользователь сделал запись, но не ввёл контактные данные, попробовать найти пользователя по существующим данным:</b>

Имя пользователя в телеграм: ${request.userFullName}
Телеграм username: ${usernameLink}
Услуга: ${selectedService.name}
Дата: ${formatToDate(request.date)}

Или подтвердить / отклонить запись (в случае отказа, пользователь не будет уведомлен)
Ты так же можешь увидеть статус всех реквестов через <a href="https://youjob13.github.io/annsh/">админку</a>
`;

    const inlineKeyboard = createInlineKeyboard([
        [`Подтвердить запись`, createDataForPartialRequestInlineQuery(InlineQuery.ApproveNewRequest, request)],
        [`Отклонить запись`, createDataForPartialRequestInlineQuery(InlineQuery.RejectPartialNewRequest, request)],
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
