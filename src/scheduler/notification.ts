import { CronJob } from 'cron';

import bot from '../bot/bot.js';
import { ADMIN_ID } from '../bot/commands/handlers/constants.js';
import { requestCollection, scheduleCollection } from '../db/handlers/index.js';
import { schedulerLogger } from '../logger.js';
import { formatToDate, getNonNullableValues } from '../shared/utils.js';

const ONE_DAY = 24 * 60 * 60 * 1000;

const pushNotification = async () => {
    try {
        const now = Date.now();
        const dates = await scheduleCollection.getBookedNotNotifiedDates();

        const needNotificationDates = dates
            .filter(({ timestamp }) => timestamp - now < ONE_DAY)
            .map(({ uniqueId }) => uniqueId.split('|'));

        if (needNotificationDates.length === 0) {
            return;
        }

        const needNotificationRequests = getNonNullableValues(
            await Promise.all(
                needNotificationDates.map(async ([chatId, requestId]) =>
                    requestCollection.getApprovedRequestByChatIdAndRequestId(Number(chatId), requestId),
                ),
            ),
        );

        for (const request of needNotificationRequests) {
            const userNotificationPromise = bot.api.sendMessage(
                request.chatId,
                `Привет! Напоминаю, что Вы записаны завтра на сеанс!🤍 \n Дата: ${formatToDate(request.date)} `,
            );
            const adminNotificationPromise = bot.api.sendMessage(
                ADMIN_ID,
                `Запись на завтра:\n ${request.userFullName}\n @${request.username}\n ${formatToDate(request.date)}\n ${
                    request.userCustomData
                }`,
            );
            const markDateAsNotifiedPromise = scheduleCollection.markDateIsNotified(
                `${request.chatId}|${request.requestId}`,
            );

            await Promise.all([userNotificationPromise, adminNotificationPromise, markDateAsNotifiedPromise]);
        }
    } catch (error) {
        schedulerLogger.error('error', error);
    }
};

const job = new CronJob('*/15 * * * * *', pushNotification, null, false, 'Europe/Berlin');

export default job;
