import { Composer, Context } from 'grammy';
import { Chat } from 'grammy/types';

import * as DTO from '../../../../dto/index.js';
import {
    messagesToUsersCollection,
    requestCollection,
    scheduleCollection,
    servicesCollection,
} from '../../../db/handlers/index.js';
import { userCurrentRequestState } from '../../../db/inMemory.js';
import { botLogger } from '../../../logger.js';
import { formatToDate, formatToTimestamp } from '../../../shared/utils.js';
import bot, { calendar } from '../../bot.js';
import { getUserFullName, getUsernameLink } from '../../helpers.js';
import { InlineQuery, createInlineKeyboard, makeInlineQueriesWithOptions } from '../../keyboards/index.js';
import { ADMIN_ID, ADMIN_ID_2 } from '../constants.js';
import { extractServiceTypeFromQuery, generateRequestFromUser } from '../helpers.js';

const getAvailableDatesTitle = (availableDates: DTO.ISchedule['timestamp'][]) =>
    `<b>Свободные даты:</b>

${availableDates.map(formatToDate).join('\n')}`;

const formatNewMessageFromUser = (ctx: Context, format: 'text' | 'caption') => {
    return `Новое сообщение от ${getUsernameLink(
        ctx.message.from.username,
        getUserFullName(ctx.message.chat as Chat.PrivateChat),
    )}:\n${ctx.msg[format] ?? ''}`;
};

const composer = new Composer();

// todo: find better approach then message event to get user info
composer.on('message', async ctx => {
    try {
        const chatId = ctx.message.chat.id;

        botLogger.info(`New message from ${chatId}`, ctx.msg);

        // todo: should be in another place
        if (ctx.msg.text === 'getavailabledates' && (chatId === ADMIN_ID || chatId === ADMIN_ID_2)) {
            const availableDates = await scheduleCollection.getAvailableDates();
            await ctx.reply(getAvailableDatesTitle(availableDates), { parse_mode: 'HTML' });
        } else if (userCurrentRequestState.get(chatId) === DTO.RequestState.InProgress) {
            const request = await requestCollection.getLatestRequestByChatId(chatId);

            const [, selectedService] = await Promise.all([
                requestCollection.insertUserCustomDataToRequest({
                    date: request.date,
                    userCustomData: ctx.message.text.trim(),
                }),
                servicesCollection.getService(request.serviceType),
            ]);

            await ctx.reply('Ожидайте подтверждения записи по указанным выше контактам 🤍');

            const { content, options } = generateRequestFromUser({ ctx, request, selectedService });

            await bot.api.sendMessage(ADMIN_ID_2, content, options);
        } else if (ctx.msg.text) {
            await bot.api.sendMessage(ADMIN_ID_2, formatNewMessageFromUser(ctx, 'text'));
        } else if (ctx.msg.voice) {
            await bot.api.sendMessage(ADMIN_ID_2, formatNewMessageFromUser(ctx, 'caption'));
            await bot.api.sendVoice(ADMIN_ID_2, ctx.msg.voice.file_id);
        } else if (ctx.msg.photo) {
            await bot.api.sendMessage(ADMIN_ID_2, formatNewMessageFromUser(ctx, 'caption'));
            await bot.api.sendPhoto(ADMIN_ID_2, ctx.msg.photo[ctx.msg.photo.length - 1].file_id);
        } else if (ctx.msg.video) {
            await bot.api.sendMessage(ADMIN_ID_2, formatNewMessageFromUser(ctx, 'caption'));
            await bot.api.sendVideo(ADMIN_ID_2, ctx.msg.video.file_id);
        } else if (ctx.msg.document) {
            await bot.api.sendMessage(ADMIN_ID_2, formatNewMessageFromUser(ctx, 'caption'));
            await bot.api.sendDocument(ADMIN_ID_2, ctx.msg.document.file_id);
        }
    } catch (error) {
        botLogger.error(error);
    }
});
export const processMakeAppointment = async <TContext extends Context>(ctx: TContext) => {
    try {
        await ctx.deleteMessage();

        const serviceList = await servicesCollection.getServices();
        const servicesData = makeInlineQueriesWithOptions(serviceList, InlineQuery.SelectService);
        const selectServiceKeyboard = createInlineKeyboard(servicesData);

        await ctx.reply('Выбрать услугу 💅', { reply_markup: selectServiceKeyboard });
    } catch (error) {
        botLogger.error(`Process Make Appointment`);
        throw error;
    }
};

export const processSelectService = async <TContext extends Context>(ctx: TContext) => {
    try {
        const message = ctx.callbackQuery?.message;

        if (message == null) {
            botLogger.error('Process Select Service, message lost');
            // todo: should return response that message lost
            return;
        }

        const { value, displayName } = await extractServiceTypeFromQuery(ctx);

        const availableDates = await scheduleCollection.getAvailableDates();

        await ctx.deleteMessage();
        await ctx.reply('Вы выбрали услугу: ' + displayName);
        await calendar.startNavCalendarWithAvailableDates(ctx, availableDates, value);
    } catch (error) {
        botLogger.error('Process Select Service');
        throw error;
    }
};

export const processSelectDate = async <TContext extends Context>(ctx: TContext) => {
    try {
        const { res, additionalPayload: serviceType } = calendar.clickButtonCalendar(ctx);

        if (res !== -1 && typeof res != 'number') {
            const message = ctx.callbackQuery?.message;

            if (message == null) {
                botLogger.error('Process Select Date, message lost');
                // todo: should return response that message lost
                return;
            }

            const chat = message.chat as Chat.PrivateChat;
            const chatId = chat.id;
            const date = formatToTimestamp(res);

            const createRequestPromise = requestCollection.createRequest({
                chatId,
                serviceType,
                date,
                isApproved: false,
                username: chat.username,
                userFullName: getUserFullName(chat),
            });

            const bookDatePromise = scheduleCollection.bookDate(date);

            await Promise.all([createRequestPromise, bookDatePromise]);

            await ctx.reply('Вы выбрали дату: ' + formatToDate(res));
            await ctx.reply('Введите номер телефона/ник в Instagram и имя для подтверждения записи🫶🏻');

            userCurrentRequestState.set(chatId, DTO.RequestState.InProgress);
        }
    } catch (error) {
        botLogger.error('Process Select Date');
        throw error;
    }
};

export const processApproveNewRequest = async <TContext extends Context>(ctx: TContext) => {
    try {
        const [, date] = ctx.callbackQuery.data.split('|');

        const [request, address] = await Promise.all([
            requestCollection.approveUserRequest(Number(date)),
            messagesToUsersCollection.getLocation('location'),
        ]);
        const usernameLink = getUsernameLink(request.username, request.userFullName);

        await ctx.editMessageReplyMarkup(undefined);
        await ctx.reply(`Запись для ${usernameLink} подтверждена`, { parse_mode: 'HTML' });
        await bot.api.sendMessage(
            request.chatId,
            `Ваша запись подтверждена, жду Вас в ${formatToDate(request.date)} по адресу:${address.value.replace(
                /\\n/g,
                '\n',
            )}`,
        );
        await bot.api.sendMessage(request.chatId, `В случае отмены записи пиши в Instagram annushkka.nails 🤍`);

        userCurrentRequestState.delete(request.chatId);
    } catch (error) {
        botLogger.error('Process Approve New Request');
        throw error;
    }
};

export const processRejectNewRequest = async <TContext extends Context>(
    ctx: TContext,
    needNotifyUser: boolean = true,
) => {
    try {
        const [, date] = ctx.callbackQuery.data.split('|');

        const request = await requestCollection.getRequestByDate(Number(date));
        await scheduleCollection.unBookDate(request.date);

        const usernameLink = getUsernameLink(request.username, request.userFullName);

        await ctx.deleteMessage();
        await ctx.reply(`Запись для ${usernameLink} отклонена`, { parse_mode: 'HTML' });

        if (needNotifyUser) {
            await bot.api.sendMessage(request.chatId, `Ваша запись отклонена :(`);
        }

        userCurrentRequestState.delete(Number(request.chatId));
    } catch (error) {
        botLogger.error('Process Reject New Request');
        throw error;
    }
};

export default composer;
