import { Bot, GrammyError, HttpError } from 'grammy';

import { apiThrottler } from '@grammyjs/transformer-throttler';

import * as Config from '../config.js';
import { botLogger } from '../logger.js';

const bot = new Bot(Config.TG_BOT_TOKEN);
// bot.chatType('private');

bot.catch(err => {
    const ctx = err.ctx;
    botLogger.error(`Error while handling update ${ctx.update.update_id}:`);

    const error = err.error;
    if (error instanceof GrammyError) {
        botLogger.error('Error in request (Grammy error):', error.description);
    } else if (error instanceof HttpError) {
        botLogger.error('Could not contact Telegram (HTTP error):', error);
    } else {
        botLogger.error('Unknown error:', error);
    }
});

bot.api.config.use(apiThrottler());

// bot.use(botHandlers);

export default bot;

// bot.use(dateMenu);
// bot.use(monthMenu);
// bot.use(serviceMenu);
// bot.use(registrationMenu);
// // bot.use(logRequestInfo);

// await bot.api.setMyCommands([
//     { command: 'start', description: 'Start the bot' },
//     { command: 'help', description: 'Show help text' },
//     { command: 'stop', description: 'Stop the bot' },
// ]);

// const GREETING_MESSAGE = `Привет🤍
// Здесь ты можешь записаться на удобный день и время на маникюр✨`;

// bot.command('start', async ctx => {
//     await ctx.reply(GREETING_MESSAGE, { reply_markup: registrationMenu });
// });

// bot.start({
//     onStart: () => {
//         botLogger.info('Bot started!');
//     },
// });
