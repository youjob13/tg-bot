import { Bot, GrammyError, HttpError } from 'grammy';

import { apiThrottler } from '@grammyjs/transformer-throttler';

import * as Config from '../config.js';
import { botLogger } from '../logger.js';
import commands, { COMMAND_LIST } from './commands/index.js';
import menus from './menus/menu.js';

const createBot = async () => {
    const bot = new Bot(Config.TG_BOT_TOKEN);

    await bot.api.setMyCommands(COMMAND_LIST);

    bot.api.config.use(apiThrottler());

    bot.use(...menus);
    bot.use(...commands);

    bot.on('message', ctx => {
        console.log(ctx.msg);
    });

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

    return bot;
};

const bot = await createBot();
export default bot;
