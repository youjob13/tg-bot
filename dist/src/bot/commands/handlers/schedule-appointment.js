import { Composer } from 'grammy';
import * as DTO from '../../../../dto/index.js';
import { requestCollection, scheduleCollection } from '../../../db/handlers/index.js';
import { botLogger } from '../../../logger.js';
import { formatToDate, formatToTimestamp } from '../../../shared/utils.js';
import bot, { calendar } from '../../bot.js';
import { getUserFullName, getUsernameLink } from '../../helpers.js';
import { InlineQuery, ServiceByOption, selectServiceKeyboard } from '../../keyboards/index.js';
import { ADMIN_ID } from './constants.js';
import { extractServiceTypeFromQuery, generateRequestFromUser, generateUniqueRequestId } from './helpers.js';
import { isQueryFor } from './isQueryFor.js';
const composer = new Composer();
// if user don't answer, request will in progress until server down
// maybe it makes sense to store in db
const userCurrentRequestState = new Map();
// todo: find better approach then message event to get user info
composer.on('message', async (ctx) => {
    const chatId = ctx.message.chat.id;
    // todo: should be in another place
    if (ctx.msg.text === 'getavailabledates' && chatId === ADMIN_ID) {
        const availableDates = await scheduleCollection.getAvailableDates();
        await ctx.reply(`<b>Свободные даты:</b>

${availableDates.map(formatToDate).join('\n')}`, { parse_mode: 'HTML' });
        return;
    }
    if (userCurrentRequestState.get(chatId) === DTO.RequestState.InProgress) {
        const request = await requestCollection.getLatestRequestByChatId(chatId);
        await Promise.all([
            requestCollection.insertUserCustomDataToRequest({
                chatId,
                requestId: request.requestId,
                userCustomData: ctx.message.text.trim(),
            }),
            scheduleCollection.bookDate(request.date, `${request.chatId}|${request.requestId}`),
        ]);
        await ctx.reply('Ожидайте подтверждения записи по указанным выше контактам 🤍');
        const { content, options } = generateRequestFromUser({ ctx, request });
        await bot.api.sendMessage(ADMIN_ID, content, options);
    }
});
composer.on('callback_query:data', async (ctx) => {
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
        }
    }
    catch (error) {
        botLogger.error(error);
    }
});
const processMakeAppointment = async (ctx) => {
    await ctx.deleteMessage();
    await ctx.reply('Выберите услугу 💅', { reply_markup: selectServiceKeyboard });
};
const processSelectService = async (ctx) => {
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
const processSelectDate = async (ctx) => {
    const { res, additionalPayload: serviceType } = calendar.clickButtonCalendar(ctx);
    if (res !== -1 && typeof res != 'number') {
        const message = ctx.callbackQuery?.message;
        if (message == null) {
            // todo: should return response that message lost
            return;
        }
        const chat = message.chat;
        const chatId = chat.id;
        const date = formatToTimestamp(res);
        await requestCollection.createRequest({
            chatId,
            requestId: generateUniqueRequestId(date, serviceType),
            serviceType: serviceType,
            date,
            isApproved: false,
            username: chat.username,
            userFullName: getUserFullName(chat),
        });
        await ctx.reply('Вы выбрали дату: ' + res);
        await ctx.reply('Введите ник в instagram / номер телефона и имя для подтверждения записи: ');
        userCurrentRequestState.set(chatId, DTO.RequestState.InProgress);
    }
};
const processApproveNewRequest = async (ctx) => {
    const [, chatId, requestId] = ctx.callbackQuery.data.split('|');
    const request = (await requestCollection.approveUserRequest(Number(chatId), requestId));
    const usernameLink = getUsernameLink(request.username, request.userFullName);
    await ctx.deleteMessage();
    await ctx.reply(`Запись для ${usernameLink} подтверждена`, { parse_mode: 'HTML' });
    await bot.api.sendMessage(chatId, `Ваша запись подтверждена`);
    userCurrentRequestState.delete(Number(chatId));
};
const processRejectNewRequest = async (ctx) => {
    const [, chatId, requestId] = ctx.callbackQuery.data.split('|');
    const request = await requestCollection.getRequestByChatIdAndRequestId(Number(chatId), requestId);
    await scheduleCollection.unBookDate(request.date);
    const usernameLink = getUsernameLink(request.username, request.userFullName);
    await ctx.deleteMessage();
    await ctx.reply(`Запись для ${usernameLink} отклонена`, { parse_mode: 'HTML' });
    await bot.api.sendMessage(chatId, `Ваша запись отклонена :(`);
    userCurrentRequestState.delete(Number(chatId));
};
export default composer;
//# sourceMappingURL=schedule-appointment.js.map