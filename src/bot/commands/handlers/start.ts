import { Composer } from 'grammy';

import { makeAppointmentKeyboard } from '../../keyboards/inline-keyboards.js';

const composer = new Composer();

composer.command('start', async ctx => {
    await ctx.reply(`Привет🤍 \nЗдесь ты можешь записаться на удобный день и время на маникюр✨`);
    await ctx.reply('Для записи нажимай кнопку ниже👇🏼', { reply_markup: makeAppointmentKeyboard });
});

export default composer;
