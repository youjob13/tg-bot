import dayjs from 'dayjs';
import { readFile } from 'fs/promises';
import type { Api, Bot, Context, RawApi } from 'grammy';
import {
    ForceReply,
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    ReplyKeyboardMarkup,
    ReplyKeyboardRemove,
} from 'grammy/types';
import { createRequire } from 'module';
import { Calendar, type ICalendarOptions } from 'telegram-inline-calendar';

const lang = JSON.parse((await readFile(new URL('../assets/language.json', import.meta.url))).toString());

class TgInlineCalendar extends Calendar {
    declare options: ICalendarOptions;
    declare chats: Map<any, any>;
    declare replyMarkupObject: (
        keyboard: InlineKeyboardMarkup & ReplyKeyboardMarkup & ReplyKeyboardRemove & ForceReply,
    ) => any;
    declare editMessageReplyMarkupCalendar: (date: Date, ctx: Context, freeDates?: number[]) => void;
    declare editMessageReplyMarkupTime: (date: any, ctx: Context, from_calendar: boolean) => void;
    declare clickButtonCalendar: (ctx: Context) => string | number;
    declare deleteMessage: (ctx: Context) => void;
    declare sendMessageCalendar: (reply_markup: any, ctx: Context) => Promise<void>;
    declare howMuchDays: (year: number, month: number) => number;
    declare colRowNavigation: (date: Date, cd: number) => number;
    declare weekDaysButtons: (date: number) => any;
    declare startWeekDay: (date: number) => number;
    declare twoDigits: (n: number) => string;

    constructor(bot: Bot<Context, Api<RawApi>>, options: ICalendarOptions) {
        super(bot, options);
        this.options = options;

        this.clickButtonCalendar = ctx => {
            if (ctx.callbackQuery.data == ' ') {
                return -1;
            }
            const code = ctx.callbackQuery.data.split('_');

            let date;
            let res: any = -1;
            if (code[0] == 'n') {
                switch (code[2]) {
                    case '++':
                        date = new Date(code[1]);
                        date.setFullYear(date.getFullYear() + 1);
                        this.editMessageReplyMarkupCalendar(date, ctx, code[3].split(',').map(Number));
                        break;
                    case '--':
                        date = new Date(code[1]);
                        date.setFullYear(date.getFullYear() - 1);
                        this.editMessageReplyMarkupCalendar(date, ctx, code[3].split(',').map(Number));
                        break;
                    case '+':
                        date = new Date(code[1]);
                        if (date.getMonth() + 1 == 12) {
                            date.setFullYear(date.getFullYear() + 1);
                            date.setMonth(0);
                        } else {
                            date.setMonth(date.getMonth() + 1);
                        }
                        this.editMessageReplyMarkupCalendar(date, ctx, code[3].split(',').map(Number));
                        break;
                    case '-':
                        date = new Date(code[1]);
                        if (date.getMonth() - 1 == -1) {
                            date.setFullYear(date.getFullYear() - 1);
                            date.setMonth(11);
                        } else {
                            date.setMonth(date.getMonth() - 1);
                        }
                        this.editMessageReplyMarkupCalendar(date, ctx, code[3].split(',').map(Number));
                        break;
                    case '0':
                        if (this.options.close_calendar === true && this.options.time_selector_mod === false) {
                            this.deleteMessage(ctx);
                            this.chats.delete(ctx.callbackQuery.message.chat.id);
                        }
                        if (this.options.time_selector_mod === true) {
                            this.editMessageReplyMarkupTime(dayjs(code[1]).format('YYYY-MM-DD HH:mm'), ctx, true);
                        } else {
                            const require = createRequire(import.meta.url);
                            require('dayjs/locale/' + this.options.language);
                            res = dayjs(code[1]).locale(this.options.language).format(this.options.date_format);
                        }
                }
            } else if (code[0] == 't') {
                switch (code[2]) {
                    case 'back':
                        date = new Date(code[1]);
                        date.setDate(1);
                        this.editMessageReplyMarkupCalendar(date, ctx, code[3].split(',').map(Number));
                        break;
                    case '1+':
                        this.editMessageReplyMarkupTime(dayjs(code[1]), ctx, true);
                        break;
                    case '1-':
                        date = dayjs(code[1]).subtract(
                            16 * parseInt(this.options.time_step.slice(0, -1)),
                            this.options.time_step.slice(-1) as 'd' | 'h' | 'm' | 's' | undefined,
                        );
                        this.editMessageReplyMarkupTime(date, ctx, true);
                        break;
                    case '0+':
                        this.editMessageReplyMarkupTime(dayjs(code[1]), ctx, false);
                        break;
                    case '0-':
                        date = dayjs(code[1]).subtract(
                            16 * parseInt(this.options.time_step.slice(0, -1)),
                            this.options.time_step.slice(-1) as 'd' | 'h' | 'm' | 's' | undefined,
                        );
                        this.editMessageReplyMarkupTime(date, ctx, false);
                        break;
                    case '0':
                        if (this.options.close_calendar === true) {
                            this.deleteMessage(ctx);
                            this.chats.delete(ctx.callbackQuery.message.chat.id);
                        }
                        // eslint-disable-next-line
                        const require = createRequire(import.meta.url);
                        require('dayjs/locale/' + this.options.language);
                        res = dayjs(code[1]).locale(this.options.language).format(this.options.date_format);
                }
            }
            return res;
        };

        this.editMessageReplyMarkupCalendar = (date: Date, ctx: Context, freeDates: number[]) => {
            ctx.editMessageReplyMarkup(this.replyMarkupObject(this.createNavigationKeyboard(date, freeDates)));
        };
    }

    public async startNavCalendarWithFreeDates(ctx: Context, freeDates?: number[]) {
        const now = new Date();
        now.setDate(1);
        now.setHours(0);
        now.setMinutes(0);
        now.setSeconds(0);
        this.sendMessageCalendar(this.replyMarkupObject(this.createNavigationKeyboard(now, freeDates)), ctx);
    }

    public createNavigationKeyboard(date: Date, freeDates: number[] = []) {
        let column, row;
        const keyboard = {} as InlineKeyboardMarkup & ReplyKeyboardMarkup & ReplyKeyboardRemove & ForceReply;
        const cd = this.howMuchDays(date.getFullYear(), date.getMonth() + 1);
        const cr = this.colRowNavigation(date, cd);
        keyboard.resize_keyboard = true;
        keyboard.inline_keyboard = [];
        keyboard.inline_keyboard.push([{}, {}, {}] as InlineKeyboardButton[]);
        if (
            !this.options.start_date ||
            (this.options.start_date && dayjs(date).format('YYYY') > dayjs(this.options.start_date).format('YYYY'))
        ) {
            if (dayjs(date).subtract(1, 'year').format('YYYY') == dayjs(this.options.start_date).format('YYYY')) {
                keyboard.inline_keyboard[0][0] = {
                    text: '<<',
                    callback_data: 'n_' + dayjs(this.options.start_date).add(1, 'year').format('YYYY-MM') + '_--',
                };
            } else {
                keyboard.inline_keyboard[0][0] = {
                    text: '<<',
                    callback_data: 'n_' + dayjs(date).format('YYYY-MM') + '_--',
                };
            }
        } else {
            keyboard.inline_keyboard[0][0] = { text: ' ', callback_data: ' ' };
        }
        keyboard.inline_keyboard[0][1] = {
            text: lang.month3[this.options.language][date.getMonth()] + ' ' + date.getFullYear(),
            callback_data: ' ',
        };
        if (
            !this.options.stop_date ||
            (this.options.stop_date && dayjs(this.options.stop_date).format('YYYY') > dayjs(date).format('YYYY'))
        ) {
            if (dayjs(date).add(1, 'year').format('YYYY') == dayjs(this.options.stop_date).format('YYYY')) {
                keyboard.inline_keyboard[0][2] = {
                    text: '>>',
                    callback_data: 'n_' + dayjs(this.options.stop_date).subtract(1, 'year').format('YYYY-MM') + '_++',
                };
            } else {
                keyboard.inline_keyboard[0][2] = {
                    text: '>>',
                    callback_data: 'n_' + dayjs(date).format('YYYY-MM') + '_++',
                };
            }
        } else {
            keyboard.inline_keyboard[0][2] = { text: ' ', callback_data: ' ' };
        }
        keyboard.inline_keyboard.push([{}, {}, {}, {}, {}, {}, {}] as InlineKeyboardButton[]);
        for (row = 0; row < 7; row++) {
            keyboard.inline_keyboard[1][row] = {
                text: lang.week[this.options.language][this.weekDaysButtons(row)],
                callback_data: ' ',
            };
        }
        let d = 1;
        for (column = 2; column <= cr - 2; column++) {
            keyboard.inline_keyboard.push([{}, {}, {}, {}, {}, {}, {}] as InlineKeyboardButton[]);
            for (row = 0; row < 7; row++) {
                if ((column == 2 && row < this.startWeekDay(date.getDay())) || d > cd) {
                    keyboard.inline_keyboard[column][row] = { text: ' ', callback_data: ' ' };
                } else {
                    if (
                        (!this.options.start_date ||
                            (this.options.start_date &&
                                dayjs(date).date(d).hour(0).diff(dayjs(this.options.start_date).hour(0), 'day') >=
                                    0)) &&
                        (!this.options.stop_date ||
                            (this.options.stop_date &&
                                dayjs(this.options.stop_date).hour(0).diff(dayjs(date).date(d).hour(0), 'day') >= 0))
                    ) {
                        const isFreeDate = freeDates.includes(d);
                        keyboard.inline_keyboard[column][row] = {
                            text: isFreeDate ? `${d}` : '-',
                            callback_data: isFreeDate
                                ? `n_${date.getFullYear()}-${this.twoDigits(date.getMonth() + 1)}-${this.twoDigits(
                                      d,
                                  )}_0`
                                : ' ',
                        };
                    } else {
                        keyboard.inline_keyboard[column][row] = { text: ' ', callback_data: ' ' };
                    }
                    d++;
                }
            }
        }
        keyboard.inline_keyboard.push([{}, {}, {}] as InlineKeyboardButton[]);
        if (
            !this.options.start_date ||
            (this.options.start_date &&
                Math.round(dayjs(date).date(1).diff(dayjs(this.options.start_date).date(1), 'month', true)) > 0)
        ) {
            keyboard.inline_keyboard[cr - 1][0] = {
                text: '<',
                callback_data: 'n_' + dayjs(date).format('YYYY-MM') + '_-' + `_${freeDates}`,
            };
        } else {
            keyboard.inline_keyboard[cr - 1][0] = { text: ' ', callback_data: ' ' };
        }
        keyboard.inline_keyboard[cr - 1][1] = { text: ' ', callback_data: ' ' };
        if (
            !this.options.stop_date ||
            (this.options.stop_date &&
                Math.round(dayjs(this.options.stop_date).date(1).diff(dayjs(date).date(1), 'month', true)) > 0)
        ) {
            keyboard.inline_keyboard[cr - 1][2] = {
                text: '>',
                callback_data: 'n_' + dayjs(date).format('YYYY-MM') + '_+' + `_${freeDates}`,
            };
        } else {
            keyboard.inline_keyboard[cr - 1][2] = { text: ' ', callback_data: ' ' };
        }
        return keyboard;
    }
}

export default TgInlineCalendar;
