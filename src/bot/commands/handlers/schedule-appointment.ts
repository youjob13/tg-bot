import dayjs from 'dayjs';
import { Composer, Context } from 'grammy';
import { Chat } from 'grammy/types';
import { WithId } from 'mongodb';

import * as DTO from '../../../../dto/index.js';
import { requesterCollection, scheduleCollection } from '../../../db/handlers/index.js';
import bot, { calendar } from '../../bot.js';
import { getUserFullName, getUsernameLink } from '../../helpers.js';
import { InlineQuery, ServiceByOption, selectServiceKeyboard } from '../../keyboards/index.js';
import { ADMIN_ID } from './constants.js';
import { extractServiceTypeFromQuery, generateRequestFromUser, generateUniqueRequestId } from './helpers.js';
import { isQueryFor } from './isQueryFor.js';

const composer = new Composer();
// if user don't answer, request will in progress until server down
// maybe it makes sense to store in db
const userCurrentRequestState = new Map<number, DTO.RequestState>();
// todo: find better approach then message event to get user info
composer.on('message', async ctx => {
    const chatId = ctx.message.chat.id;

    // todo: should be in another place
    if (ctx.msg.text === 'getavailabledates' && chatId === ADMIN_ID) {
        const availableDates = await scheduleCollection.getAvailableDates();

        await ctx.reply(
            `<b>Свободные даты:</b>

${availableDates.map(timestamp => dayjs(timestamp).format('YYYY-MM-DD HH:mm')).join('\n')}`,
            { parse_mode: 'HTML' },
        );
        return;
    }

    if (userCurrentRequestState.get(chatId) === DTO.RequestState.InProgress) {
        const requesterInfo = await requesterCollection.getRequesterInfo(chatId);
        const latestServiceInfo = requesterInfo.data[requesterInfo.data.length - 1];

        await ctx.reply('Ожидайте подтверждения записи по указанным выше контактам 🤍');

        const { content, options } = generateRequestFromUser({ ctx, latestServiceInfo });

        await bot.api.sendMessage(ADMIN_ID, content, options);
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

    if (res !== -1 && typeof res != 'number') {
        const message = ctx.callbackQuery?.message;

        if (message == null) {
            // todo: should return response that message lost
            return;
        }

        const chat = message.chat as Chat.PrivateChat;
        const chatId = chat.id;

        await requesterCollection.upsertRequesterInfo(chatId, {
            requestId: generateUniqueRequestId(+new Date(res), serviceType as DTO.ServiceOption),
            serviceType: serviceType as DTO.ServiceOption,
            date: +new Date(res),
            isApproved: false,
            username: chat.username,
            userFullName: getUserFullName(chat),
        });

        await ctx.reply('Вы выбрали дату: ' + res);
        await ctx.reply('Введите ник в instagram / номер телефона и имя для подтверждения записи: ');

        userCurrentRequestState.set(chatId, DTO.RequestState.InProgress);
    }
};

const processApproveNewRequest = async <TContext extends Context>(ctx: TContext) => {
    const [, chatId, requestId] = ctx.callbackQuery.data.split('|');

    // todo: rework the way how store data in db
    const requests = (await requesterCollection.approveUserRequest(
        Number(chatId),
        requestId,
    )) as WithId<DTO.IRequesterInfo>;

    const requestInfo = requests.data.find(request => request.requestId === requestId);
    await scheduleCollection.bookDate(requestInfo.date);

    const usernameLink = getUsernameLink(requestInfo.username, requestInfo.userFullName);

    await ctx.deleteMessage();
    await ctx.reply(`Запись для ${usernameLink} подтверждена`, { parse_mode: 'HTML' });
    await bot.api.sendMessage(chatId, `Ваша запись подтверждена`);

    userCurrentRequestState.delete(Number(chatId));
};

const processRejectNewRequest = async <TContext extends Context>(ctx: TContext) => {
    const [, chatId, requestId] = ctx.callbackQuery.data.split('|');

    // todo: rework the way how store data in db
    const requests = (await requesterCollection.approveUserRequest(
        Number(chatId),
        requestId,
    )) as WithId<DTO.IRequesterInfo>;

    const requestInfo = requests.data.find(request => request.requestId === requestId);
    const usernameLink = getUsernameLink(requestInfo.username, requestInfo.userFullName);

    await ctx.deleteMessage();
    await ctx.reply(`Запись для ${usernameLink} отклонена`, { parse_mode: 'HTML' });
    await bot.api.sendMessage(chatId, `Ваша запись отклонена :(`);

    userCurrentRequestState.delete(Number(chatId));
};

export default composer;
