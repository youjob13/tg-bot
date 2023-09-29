import { Context } from 'grammy';

import { createSimpleTextMenu } from './utils.js';

const serviceMenuHandler = async (ctx: Context) => {
    await ctx.reply('Выберите месяц:', { reply_markup: monthMenu });
};

const monthMenuHandler = async (ctx: Context) => {
    await ctx.reply('Выберите дату:', { reply_markup: dateMenu });
};

const monthMenu = createSimpleTextMenu('monthMenu', ['Октябрь', 'Ноябрь', 'Декабрь'], monthMenuHandler);
const dateMenu = createSimpleTextMenu(
    'dateMenu',
    ['1 октября - 9:00', '2 октября - 9:00', '15 сентября'],
    monthMenuHandler,
);

const serviceMenu = createSimpleTextMenu(
    'service_menu',
    [
        'Маникюр (от 25€)',
        'Маникюр + покрытие (от 40€)',
        'Наращивание ногтей 1-2 (от 50€)',
        'Наращивание ногтей 3-4 (от 60€)',
    ],
    serviceMenuHandler,
);

const registrationMenu = createSimpleTextMenu('registration_menu', ['Записаться'], async (ctx: Context) => {
    await ctx.reply('Выберите услугу:', { reply_markup: serviceMenu });
});

export { registrationMenu, serviceMenu, monthMenu, dateMenu };
