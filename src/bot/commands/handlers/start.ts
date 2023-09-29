import { Composer } from 'grammy';

import { makeAppointmentKeyboard } from '../../keyboards/inline-keyboards.js';

const composer = new Composer();

export let ownerChatId: number | null = null;

composer.command('start', async ctx => {
    if (ctx.message?.from.username === 'youjob13' /*Config.OWNER_USER_NAME*/) {
        ownerChatId = ctx.message?.chat.id;
        console.log('owner chat id:', ownerChatId);
    }

    await ctx.reply(`Привет🤍 \nЗдесь ты можешь записаться на удобный день и время на маникюр✨`);
    await ctx.reply('Если хочешь записаться, кликай ниже', { reply_markup: makeAppointmentKeyboard });
});

export default composer;
