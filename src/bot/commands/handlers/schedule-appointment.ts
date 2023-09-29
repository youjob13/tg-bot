import { Composer, Context } from 'grammy';

import bot, { calendar } from '../../bot.js';
import {
    InlineQuery,
    ServiceByOption,
    ServiceOption,
    processNewRequestKeyboard,
    selectServiceKeyboard,
} from '../../keyboards/index.js';
import { extractMappedDataFromQuery } from '../utils.js';
import { ownerChatId } from './start.js';

enum Query {
    SelectService,
    SelectDate,
}

// todo: request to db
const getFreeDates = () => {
    return [21, 25, 29, 30];
};

const queryIs = (ctx: Context) => {
    const isSelectServiceQuery = ctx.callbackQuery?.data?.includes(InlineQuery.SelectService);

    if (isSelectServiceQuery) {
        return Query.SelectService;
    }

    //@ts-ignore
    const isSelectDateQuery = ctx.msg?.message_id == calendar.chats.get(ctx.chat?.id);

    if (isSelectDateQuery) {
        return Query.SelectDate;
    }
};

const composer = new Composer();

composer.callbackQuery(InlineQuery.MakeAppointment, async ctx => {
    await ctx.deleteMessage();
    await ctx.reply('Выберите услугу 💅', { reply_markup: selectServiceKeyboard });
});

let servicesIsSelected = false;

interface IRequesterInfo {
    chatId: number;
    // todo: isApproved should be false by default
    data: { serviceType: ServiceOption; date: string; isApproved?: boolean }[];
}
// todo: save requester info to db for future notification
const requestersInfo = new Map<IRequesterInfo['chatId'], IRequesterInfo>();

// todo: find better approach then message event to get user info
composer.on('message', async ctx => {
    if (servicesIsSelected && ownerChatId != null) {
        // should get new service info
        const requesterInfo = requestersInfo.get(ctx.message.chat.id);
        const latestServiceInfo = requesterInfo.data[requesterInfo.data.length - 1];

        await ctx.reply('Ожидайте подтверждения записи по указанным выше контактам 🤍');

        console.log('requesterInfo', latestServiceInfo);

        await bot.api.sendMessage(
            ownerChatId,
            `
        <b>Новый запрос на запись</b>

        Имя пользователя в телеграм: ${ctx.message.from.first_name} ${ctx.message.from.last_name}
        Телеграм username: ${ctx.message.from.username}
        Введенная пользователем информация: ${ctx.message.text}
        Услуга: ${ServiceByOption[latestServiceInfo.serviceType]}
        Дата: ${latestServiceInfo.date}`,
            { parse_mode: 'HTML', reply_markup: processNewRequestKeyboard },
        );

        servicesIsSelected = false;
    }
});

composer.callbackQuery(InlineQuery.ApproveNewRequest, async ctx => {
    // todo: find way to get user unique id from ctx/or other way
    const username = 'youjob13';
    const requesterInfo = requestersInfo[username];

    await ctx.deleteMessage();
    await ctx.reply(`Запись для <i>${username}</i> подтверждена`, { parse_mode: 'HTML' });
    await bot.api.sendMessage(requesterInfo.chatId, `Ваша запись подтверждена`);
});

composer.callbackQuery(InlineQuery.RejectNewRequest, async ctx => {
    // todo: find way to get user unique id from ctx/or other way
    const username = 'youjob13';
    const requesterInfo = requestersInfo[username];

    await ctx.deleteMessage();
    await ctx.reply(`Запись для <i>${username}</i> отклонена`, { parse_mode: 'HTML' });
    await bot.api.sendMessage(requesterInfo.chatId, `Ваша запись отклонена :(`);
});

composer.on('callback_query:data', async ctx => {
    switch (queryIs(ctx)) {
        case Query.SelectService: {
            await processSelectService(ctx);
            break;
        }
        case Query.SelectDate: {
            await processSelectDate(ctx);
            break;
        }
    }
});

const processSelectService = async (ctx: Context) => {
    const { value, displayName } = extractMappedDataFromQuery<{
        TData: ServiceOption;
        TMap: typeof ServiceByOption;
    }>(ctx, ServiceByOption);

    const message = ctx.callbackQuery?.message;

    if (message == null) {
        return;
    }

    const chatId = message.chat.id;
    const freeDates = getFreeDates();

    const requesterInfo = requestersInfo.get(chatId);
    if (requestersInfo.has(chatId)) {
        requestersInfo.set(chatId, {
            ...requesterInfo,
            data: [...requesterInfo.data, { serviceType: value, date: '' }],
        });
    } else {
        requestersInfo.set(chatId, {
            chatId,
            data: [{ serviceType: value, date: '' }],
        });
    }

    await ctx.deleteMessage();
    await ctx.reply('Вы выбрали услугу: ' + displayName);
    await calendar.startNavCalendarWithFreeDates(ctx, freeDates);
};

const processSelectDate = async (ctx: Context) => {
    const selectedDate = calendar.clickButtonCalendar(ctx);
    if (selectedDate !== -1) {
        const message = ctx.callbackQuery?.message;

        if (message == null) {
            return;
        }

        const chatId = message.chat.id;
        const requesterInfo = requestersInfo.get(chatId);

        if (requestersInfo.has(chatId)) {
            requestersInfo.set(chatId, {
                ...requesterInfo,
                // todo: should save service type and date the same time
                data: [
                    ...requesterInfo.data,
                    {
                        serviceType: requesterInfo.data[requesterInfo.data.length - 1].serviceType as ServiceOption,
                        date: String(selectedDate),
                    },
                ],
            });
        } else {
            requestersInfo.set(chatId, {
                chatId,
                data: [{ serviceType: '' as ServiceOption, date: String(selectedDate) }],
            });
        }

        await ctx.reply('Вы выбрали дату: ' + selectedDate);
        servicesIsSelected = true;
        await ctx.reply('Введите ник в instagram / номер телефона и имя для подтверждения записи: ');
    }
};

export default composer;
