import { Bot, GrammyError, HttpError } from 'grammy';
import * as Config from './config.js';
import { logger } from './logger.js';
import menu from './menu.js';

const bot = new Bot(Config.TOKEN);
// bot.chatType('private');

bot.use(menu);
// bot.use(logRequestInfo);

// bot.on('chat_member:from', async ctx => {
//     // const message = ctx.chatJoinRequest;

//     // const fullName = message.from.first_name + ' ' + message.from.last_name;

//     console.log('START!');
// });

await bot.api.setMyCommands([
    { command: 'start', description: 'Start the bot' },
    { command: 'help', description: 'Show help text' },
]);

bot.command('start', async ctx => {
    await ctx.reply('Check out this menu:', { reply_markup: menu });
});

// bot.command('help', async ctx => {
//     const message = ctx.message;

//     const fullName = message.from.first_name + ' ' + message.from.last_name;

//     console.log(message);
//     await ctx.reply(`Hello, ${fullName}!`);
// });

bot.start({
    onStart: () => {
        logger.info('Bot started!');
    },
});

bot.catch(err => {
    const ctx = err.ctx;
    logger.error(`Error while handling update ${ctx.update.update_id}:`);

    const error = err.error;
    if (error instanceof GrammyError) {
        logger.error('Error in request (Grammy error):', error.description);
    } else if (error instanceof HttpError) {
        logger.error('Could not contact Telegram (HTTP error):', error);
    } else {
        logger.error('Unknown error:', error);
    }
});
