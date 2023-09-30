import { Composer, Context } from 'grammy';

import * as DTO from '../../../../dto/index.js';
import { requesterCollection, scheduleCollection } from '../../../db/handlers/index.js';
import bot, { calendar } from '../../bot.js';
import { getUsernameLink } from '../../helpers.js';
import { InlineQuery, ServiceByOption, selectServiceKeyboard } from '../../keyboards/index.js';
import { extractServiceTypeFromQuery, generateRequestFromUser } from './helpers.js';
import { isQueryFor } from './isQueryFor.js';

// todo: ADMIN_ID shouldn't be hardcoded
const ADMIN_ID = 934785648;

const composer = new Composer();
// todo: user could has multiple requests, so id should be unique (chatId+requestId)
// if user don't answer, request will in progress until server down
// maybe it makes sense to store in db
const userRequestState = new Map<number, DTO.RequestState>();
// todo: find better approach then message event to get user info
composer.on('message', async ctx => {
    const chatId = ctx.message.chat.id;

    if (userRequestState.get(chatId) === DTO.RequestState.InProgress) {
        // should get latest added service info | try to rework it with query to db
        const requesterInfo = await requesterCollection.getRequesterInfo(chatId);
        const latestServiceInfo = requesterInfo.data[requesterInfo.data.length - 1];

        await ctx.reply('Ожидайте подтверждения записи по указанным выше контактам 🤍');

        const { content, options } = generateRequestFromUser({ ctx, latestServiceInfo });

        await bot.api.sendMessage(ADMIN_ID, content, options);

        userRequestState.set(chatId, DTO.RequestState.PendingApproval);
    }
});

composer.on('callback_query:data', async ctx => {
    switch (isQueryFor(ctx)) {
        case InlineQuery.MakeAppointment: {
            await processMakeAppointment(ctx);
            break;
        }
        case InlineQuery.SelectService: {
            await processSelectService(ctx);
            break;
        }
        case InlineQuery.SelectDate: {
            await processSelectDate(ctx);
            break;
        }
        case InlineQuery.ApproveNewRequest: {
            await processApproveNewRequest(ctx);
            break;
        }
        case InlineQuery.RejectNewRequest: {
            await processRejectNewRequest(ctx);
            break;
        }
    }
});

const processMakeAppointment = async <TContext extends Context>(ctx: TContext) => {
    await ctx.deleteMessage();
    await ctx.reply('Выберите услугу 💅', { reply_markup: selectServiceKeyboard });
};

const processSelectService = async <TContext extends Context>(ctx: TContext) => {
    const message = ctx.callbackQuery?.message;

    if (message == null) {
        // todo: should return response that message lost
        return;
    }

    const { value, displayName } = extractServiceTypeFromQuery(ctx, ServiceByOption);

    const availableDates = await scheduleCollection.getAvailableDates();

    await ctx.deleteMessage();
    await ctx.reply('Вы выбрали услугу: ' + displayName);
    await calendar.startNavCalendarWithAvailableDates(ctx, availableDates, value);
};

const processSelectDate = async <TContext extends Context>(ctx: TContext) => {
    const { res, additionalPayload: serviceType } = calendar.clickButtonCalendar(ctx);

    if (res !== -1) {
        const message = ctx.callbackQuery?.message;

        if (message == null) {
            // todo: should return response that message lost
            return;
        }

        const chatId = message.chat.id;

        await requesterCollection.upsertRequesterInfo(chatId, {
            serviceType: serviceType as DTO.ServiceOption,
            date: String(res),
            isApproved: false,
        });

        await ctx.reply('Вы выбрали дату: ' + res);
        await ctx.reply('Введите ник в instagram / номер телефона и имя для подтверждения записи: ');

        userRequestState.set(ctx.msg.chat.id, DTO.RequestState.InProgress);
    }
};

const processApproveNewRequest = async <TContext extends Context>(ctx: TContext) => {
    const [, chatId, userFullName, username] = ctx.callbackQuery.data.split(':');

    const usernameLink = getUsernameLink(username, userFullName);

    // todo: unique request id
    await requesterCollection.approveUserRequest(Number(chatId), '30-09-2023 07:30');

    await ctx.deleteMessage();
    await ctx.reply(`Запись для ${usernameLink} подтверждена`, { parse_mode: 'HTML' });
    await bot.api.sendMessage(chatId, `Ваша запись подтверждена`);

    userRequestState.set(ctx.msg.chat.id, DTO.RequestState.Approved);
};

const processRejectNewRequest = async <TContext extends Context>(ctx: TContext) => {
    const [, chatId, userFullName, username] = ctx.callbackQuery.data.split(':');

    const usernameLink = getUsernameLink(username, userFullName);

    await ctx.deleteMessage();
    await ctx.reply(`Запись для ${usernameLink} отклонена`, { parse_mode: 'HTML' });
    await bot.api.sendMessage(chatId, `Ваша запись отклонена :(`);

    userRequestState.set(ctx.msg.chat.id, DTO.RequestState.Rejected);
};

export default composer;
