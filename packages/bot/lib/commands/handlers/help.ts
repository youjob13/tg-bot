import { Composer } from 'grammy';

const composer = new Composer();

composer.command('help', async ctx => {
    await ctx.reply(
        `Привет! 🤍\n\nЧтобы записаться, просто воспользуйся командой /start. Затем следуй инструкциям бота, выбери нужную услугу, подходящее время и предоставь свои контактные данные.\n\nПосле подтверждения записи ты получишь уведомление от бота 🫶🏻`,
    );
});

export default composer;
