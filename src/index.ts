import { Bot } from 'grammy';
import * as Config from './config.js';

const bot = new Bot(Config.TOKEN);

bot.on('message', ctx => ctx.reply('Hi there!'));

bot.start();
