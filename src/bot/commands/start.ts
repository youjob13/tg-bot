import { Composer } from 'grammy';

import { registrationMenu } from '../menus/menu.js';

const GREETING_MESSAGE = `Привет🤍 \nЗдесь ты можешь записаться на удобный день и время на маникюр✨`;

const composer = new Composer();

composer.command('start', async ctx => {
    await ctx.reply(GREETING_MESSAGE, { reply_markup: registrationMenu });
});

export default composer;
