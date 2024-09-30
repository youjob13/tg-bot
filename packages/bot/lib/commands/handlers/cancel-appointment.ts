import * as Config from '@ann-nails/config';
import { requestCollection, scheduleCollection, servicesCollection } from '@ann-nails/db';
import { botLogger } from '@ann-nails/logger';
import { formatToDate } from '@ann-nails/shared';
import { Composer, Context } from 'grammy';

import bot from '../../bot.js';
import { InlineQuery, createInlineKeyboard, makeInlineQueriesWithOptions } from '../../keyboards/index.js';

const composer = new Composer();

composer.command('cancel', async ctx => {
    await ctx.reply(`Вот список твоих записей👇🏼`);

    const requests = await requestCollection.getRequestsByChatId(ctx.chat.id);

    const readableRequests = await Promise.all(
        requests.map(async request => {
            const selectedService = await servicesCollection.getService(request.serviceType);
            return {
                key: String(request.date),
                name: `${formatToDate(request.date)} ${selectedService.name}`,
            };
        }),
    );

    const cancelRequestData = makeInlineQueriesWithOptions(readableRequests, InlineQuery.CancelRequest);
    const cancelRequestKeyboard = createInlineKeyboard(cancelRequestData);
    await ctx.reply('Выбери запись, которую ты хочешь отменить', { reply_markup: cancelRequestKeyboard });
});

export const processCancelRequest = async <TContext extends Context>(ctx: TContext) => {
    try {
        const [, date] = ctx.callbackQuery.data.split(':');
        await ctx.editMessageReplyMarkup(undefined);

        const [deletedRequest] = await Promise.all([
            requestCollection.removeRequest(Number(date)),
            scheduleCollection.resetDate(Number(date)),
        ]);

        const clientNotificationPromise = ctx.reply(
            `Запись на <strong>${formatToDate(Number(date))}</strong> отменена`,
            { parse_mode: 'HTML' },
        );
        const adminNotificationPromise = bot.api.sendMessage(
            Config.ADMIN_ID_2,
            `Запись для:\n ${deletedRequest.userFullName}\n @${deletedRequest.username}\n на ${formatToDate(
                deletedRequest.date,
            )}\n ${deletedRequest.userCustomData ?? '[Контактные данные не указаны]'} удалена пользователем`,
        );
        await Promise.all([clientNotificationPromise, adminNotificationPromise]);
    } catch (error) {
        botLogger.error(`Process Cancel Request`);
        throw error;
    }
};

export default composer;
