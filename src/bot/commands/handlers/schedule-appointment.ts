import { Composer, Context } from 'grammy';
import { Chat } from 'grammy/types';
import { WithId } from 'mongodb';

import * as DTO from '../../../../dto/index.js';
import { requestCollection, scheduleCollection, servicesCollection } from '../../../db/handlers/index.js';
import { userCurrentRequestState } from '../../../db/inMemory.js';
import { botLogger } from '../../../logger.js';
import { formatToDate, formatToTimestamp } from '../../../shared/utils.js';
import bot, { calendar } from '../../bot.js';
import { getUserFullName, getUsernameLink } from '../../helpers.js';
import { InlineQuery, createInlineKeyboard, makeInlineQueriesWithOptions } from '../../keyboards/index.js';
import { ADMIN_ID, ADMIN_ID_2 } from './constants.js';
import { extractServiceTypeFromQuery, generateRequestFromUser, generateUniqueRequestId } from './helpers.js';
import { isQueryFor } from './isQueryFor.js';

const composer = new Composer();

// todo: find better approach then message event to get user info
composer.on('message', async ctx => {
    const chatId = ctx.message.chat.id;

    botLogger.info(`New message from ${chatId}`, ctx.msg);

    // todo: should be in another place
    if (ctx.msg.text === 'getavailabledates' && (chatId === ADMIN_ID || chatId === ADMIN_ID_2)) {
        const availableDates = await scheduleCollection.getAvailableDates();

        await ctx.reply(
            `<b>Свободные даты:</b>

${availableDates.map(formatToDate).join('\n')}`,
            { parse_mode: 'HTML' },
        );
        return;
    } else if (userCurrentRequestState.get(chatId) === DTO.RequestState.InProgress) {
        const request = await requestCollection.getLatestRequestByChatId(chatId);

        const [, selectedService] = await Promise.all([
            requestCollection.insertUserCustomDataToRequest({
                chatId,
                requestId: request.requestId,
                userCustomData: ctx.message.text.trim(),
            }),
            servicesCollection.getService(request.serviceType),
        ]);

        await ctx.reply('Ожидайте подтверждения записи по указанным выше контактам 🤍');

        const { content, options } = generateRequestFromUser({ ctx, request, selectedService });

        await bot.api.sendMessage(ADMIN_ID_2, content, options);
    } else if (ctx.msg.text) {
        await bot.api.sendMessage(
            ADMIN_ID_2,
            `Новое сообщение от ${getUsernameLink(
                ctx.message.from.username,
                getUserFullName(ctx.message.chat as Chat.PrivateChat),
            )}:\n${ctx.msg.text}`,
        );
    } else if (ctx.msg.voice) {
        await bot.api.sendMessage(
            ADMIN_ID_2,
            `Новое сообщение от ${getUsernameLink(
                ctx.message.from.username,
                getUserFullName(ctx.message.chat as Chat.PrivateChat),
            )}:\n${ctx.msg.caption ?? ''}`,
        );
        await bot.api.sendVoice(ADMIN_ID_2, ctx.msg.voice.file_id);
    } else if (ctx.msg.photo) {
        await bot.api.sendMessage(
            ADMIN_ID_2,
            `Новое сообщение от ${getUsernameLink(
                ctx.message.from.username,
                getUserFullName(ctx.message.chat as Chat.PrivateChat),
            )}:\n${ctx.msg.caption ?? ''}`,
        );
        await bot.api.sendPhoto(ADMIN_ID_2, ctx.msg.photo[ctx.msg.photo.length - 1].file_id);
    } else if (ctx.msg.video) {
        await bot.api.sendMessage(
            ADMIN_ID_2,
            `Новое сообщение от ${getUsernameLink(
                ctx.message.from.username,
                getUserFullName(ctx.message.chat as Chat.PrivateChat),
            )}:\n${ctx.msg.caption ?? ''}`,
        );
        await bot.api.sendVideo(ADMIN_ID_2, ctx.msg.video.file_id);
    } else if (ctx.msg.document) {
        await bot.api.sendMessage(
            ADMIN_ID_2,
            `Новое сообщение от ${getUsernameLink(
                ctx.message.from.username,
                getUserFullName(ctx.message.chat as Chat.PrivateChat),
            )}:\n${ctx.msg.caption ?? ''}`,
        );
        await bot.api.sendDocument(ADMIN_ID_2, ctx.msg.document.file_id);
    }
});

// 1. show available dates for all people

composer.on('callback_query:data', async ctx => {
    try {
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
            case InlineQuery.RejectPartialNewRequest: {
                await processRejectNewRequest(ctx, false);
                break;
            }
        }
    } catch (error) {
        botLogger.error(error);
    }
});

const processMakeAppointment = async <TContext extends Context>(ctx: TContext) => {
    await ctx.deleteMessage();

    const serviceList = await servicesCollection.getServices();
    const servicesData = makeInlineQueriesWithOptions(serviceList, InlineQuery.SelectService);
    const selectServiceKeyboard = createInlineKeyboard(servicesData);

    await ctx.reply('Выбрать услугу 💅', { reply_markup: selectServiceKeyboard });
};

const processSelectService = async <TContext extends Context>(ctx: TContext) => {
    const message = ctx.callbackQuery?.message;

    if (message == null) {
        // todo: should return response that message lost
        return;
    }

    const { value, displayName } = await extractServiceTypeFromQuery(ctx);

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
        const date = formatToTimestamp(res);
        const requestId = generateUniqueRequestId(date, serviceType as DTO.IService['key']);

        const createRequestPromise = requestCollection.createRequest({
            chatId,
            requestId,
            serviceType: serviceType as DTO.IService['key'],
            date,
            isApproved: false,
            username: chat.username,
            userFullName: getUserFullName(chat),
        });

        const bookDatePromise = scheduleCollection.bookDate(date, `${chatId}|${requestId}`);

        await Promise.all([createRequestPromise, bookDatePromise]);

        await ctx.reply('Вы выбрали дату: ' + formatToDate(res));
        await ctx.reply('Введите номер телефона/ник в Instagram и имя для подтверждения записи🫶🏻');

        userCurrentRequestState.set(chatId, DTO.RequestState.InProgress);
    }
};

const processApproveNewRequest = async <TContext extends Context>(ctx: TContext) => {
    const [, chatId, requestId] = ctx.callbackQuery.data.split('|');

    const request = (await requestCollection.approveUserRequest(Number(chatId), requestId)) as WithId<DTO.IRequest>;
    const usernameLink = getUsernameLink(request.username, request.userFullName);

    await ctx.editMessageReplyMarkup(undefined);
    await ctx.reply(`Запись для ${usernameLink} подтверждена`, { parse_mode: 'HTML' });
    await bot.api.sendMessage(
        chatId,
        `Ваша запись подтверждена, жду Вас в ${formatToDate(
            request.date,
        )} по адресу:\nHagenbeckstraße 50\nU2 Lutterothstraße (5 минут пешком от станции) 🫶🏻`,
    );
    await bot.api.sendMessage(chatId, `В случае отмены записи пиши в Instagram annushkka.nails 🤍`);

    userCurrentRequestState.delete(Number(chatId));
};

const processRejectNewRequest = async <TContext extends Context>(ctx: TContext, needNotifyUser: boolean = true) => {
    const [, chatId, requestId] = ctx.callbackQuery.data.split('|');

    const request = await requestCollection.getRequestByChatIdAndRequestId(Number(chatId), requestId);
    await scheduleCollection.unBookDate(request.date);

    const usernameLink = getUsernameLink(request.username, request.userFullName);

    await ctx.deleteMessage();
    await ctx.reply(`Запись для ${usernameLink} отклонена`, { parse_mode: 'HTML' });

    if (needNotifyUser) {
        await bot.api.sendMessage(chatId, `Ваша запись отклонена :(`);
    }

    userCurrentRequestState.delete(Number(chatId));
};

export default composer;
