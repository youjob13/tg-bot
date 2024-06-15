import * as Config from '@ann-nails/config';
import { botLogger } from '@ann-nails/logger';
import { Bot, GrammyError, HttpError } from 'grammy';

import { apiThrottler } from '@grammyjs/transformer-throttler';

import TgInlineCalendar from './calendar.js';
import commands, { COMMAND_LIST } from './commands/index.js';

const createBot = async () => {
    try {
        const bot = new Bot(Config.TG_BOT.TOKEN);

        await bot.api.setMyCommands(COMMAND_LIST);

        bot.api.config.use(apiThrottler());

        bot.use(...commands);

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

        const calendar = new TgInlineCalendar(bot, {
            date_format: 'YYYY-MM-DD HH:mm',
            language: Config.TG_BOT.LANGUAGE,
            time_range: '08:00-19:00',
            bot_api: 'grammy',
            time_selector_mod: true,
            custom_start_msg: 'Выберите дату и время 📅',
        });

        return { bot, calendar };
    } catch (error) {
        botLogger.error(error);
    }
};

const { bot, calendar } = await createBot();

export { calendar };
export default bot;
