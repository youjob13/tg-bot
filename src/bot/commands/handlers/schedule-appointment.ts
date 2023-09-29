import { Composer, Context } from 'grammy';

import { calendar } from '../../bot.js';
import { INLINE_QUERY, ServiceByOption, selectServiceKeyboard } from '../../keyboards/index.js';
import { extractMappedDataFromQuery } from '../utils.js';

enum Query {
    SelectService,
    SelectDate,
}

const queryIs = (ctx: Context) => {
    const isSelectServiceQuery = ctx.callbackQuery?.data?.includes(INLINE_QUERY.selectService);

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

composer.callbackQuery(INLINE_QUERY.makeAppointment, async ctx => {
    await ctx.deleteMessage();
    await ctx.reply('Выберите услугу 💅', { reply_markup: selectServiceKeyboard });
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
    const { value, displayName } = extractMappedDataFromQuery(ctx, ServiceByOption);

    console.log('save value to db', value);

    await ctx.deleteMessage();
    await ctx.reply('Вы выбрали услугу: ' + displayName);
    //@ts-ignore
    await calendar.startNavCalendar(ctx);
};

const processSelectDate = async (ctx: Context) => {
    // @ts-ignore
    const res = calendar.clickButtonCalendar(ctx);
    if (res !== -1) {
        ctx.reply('Вы выбрали дату: ' + res);
        ctx.reply('Вы успешно записались, встретимся в назначенную дату 🤍');
    }
};

export default composer;
