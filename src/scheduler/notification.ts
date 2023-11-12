import { CronJob } from 'cron';

import bot from '../bot/bot.js';
import { ADMIN_ID_2 } from '../bot/commands/constants.js';
import * as Config from '../config.js';
import { requestCollection, scheduleCollection } from '../db/handlers/index.js';
import { schedulerLogger } from '../logger.js';
import { formatToDate, getNonNullableValues } from '../shared/utils.js';

const ONE_DAY = 24 * 60 * 60 * 1000;

const pushNotification = async () => {
    try {
        const now = Date.now();
        const dates = await scheduleCollection.getBookedNotNotifiedDates();

        const needNotificationDates = dates.filter(({ timestamp }) => timestamp - now < ONE_DAY);

        if (needNotificationDates.length === 0) {
            return;
        }

        const needNotificationRequests = getNonNullableValues(
            await Promise.all(
                needNotificationDates.map(async ({ timestamp }) =>
                    requestCollection.getApprovedRequestByDate(timestamp),
                ),
            ),
        );

        for (const request of needNotificationRequests) {
            const userNotificationPromise = bot.api.sendMessage(
                request.chatId,
                `Привет🐈‍⬛ Напоминаю, что ты записана завтра на маникюр, жду тебя🤍 \nДата: ${formatToDate(
                    request.date,
                )} `,
            );
            const adminNotificationPromise = bot.api.sendMessage(
                ADMIN_ID_2,
                `Запись на завтра:\n ${request.userFullName}\n @${request.username}\n ${formatToDate(request.date)}\n ${
                    request.userCustomData ?? '[Контактные данные не указаны]'
                }`,
            );
            const markDateAsNotifiedPromise = scheduleCollection.markDateIsNotified(request.date);

            await Promise.all([userNotificationPromise, adminNotificationPromise, markDateAsNotifiedPromise]);
        }
    } catch (error) {
        schedulerLogger.error('error', error);
    }
};

const job = new CronJob('0 0 * * * *', pushNotification, null, false, Config.TZ);

export default job;
