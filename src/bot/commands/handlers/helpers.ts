import { Context, RawApi } from 'grammy';
import { Other } from 'grammy/out/core/api';

import * as DTO from '../../../../dto/index.js';
import { servicesCollection } from '../../../db/handlers/services.js';
import { formatToDate } from '../../../shared/utils.js';
import { getUserFullName, getUsernameLink } from '../../helpers.js';
import { InlineQuery, createInlineKeyboard } from '../../keyboards/index.js';

const createDataForRequestInlineQuery = (
    inlineQuery: InlineQuery.ApproveNewRequest | InlineQuery.RejectNewRequest,
    ctx: Context,
    request: DTO.IRequest,
) => {
    const uniqueRequestId = generateUniqueRequestId(request.date, request.serviceType);
    const data = `${inlineQuery}|${ctx.message.from.id}|${uniqueRequestId}`.trim();
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
        [`Подтвердить запись`, createDataForRequestInlineQuery(InlineQuery.ApproveNewRequest, ctx, request)],
        [`Отклонить запись`, createDataForRequestInlineQuery(InlineQuery.RejectNewRequest, ctx, request)],
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

export const generateUniqueRequestId = (date: number, serviceType: DTO.IService['key']) => {
    return `${date}_${serviceType}`;
};
