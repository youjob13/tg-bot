import dayjs from 'dayjs';
import { readFile } from 'fs/promises';
import { createRequire } from 'module';
import { Calendar } from 'telegram-inline-calendar';
const lang = JSON.parse((await readFile(new URL('../assets/language.json', import.meta.url))).toString());
class TgInlineCalendar extends Calendar {
    // should be always actual
    availableDatesTimestamp = [];
    updateAvailableDatesTimestamp(availableDatesTimestamp) {
        this.availableDatesTimestamp = availableDatesTimestamp;
    }
    constructor(bot, options) {
        super(bot, options);
        this.options = options;
        this.clickButtonCalendar = ctx => {
            if (ctx.callbackQuery.data == ' ') {
                return { res: -1, additionalPayload: undefined };
            }
            const code = ctx.callbackQuery.data.split('_');
            const additionalPayload = code[3];
            let date;
            let res = -1;
            if (code[0] == 'n') {
                switch (code[2]) {
                    case '++':
                        date = new Date(code[1]);
                        date.setFullYear(date.getFullYear() + 1);
                        this.editMessageReplyMarkupCalendar(date, ctx, additionalPayload);
                        break;
                    case '--':
                        date = new Date(code[1]);
                        date.setFullYear(date.getFullYear() - 1);
                        this.editMessageReplyMarkupCalendar(date, ctx, additionalPayload);
                        break;
                    case '+':
                        date = new Date(code[1]);
                        if (date.getMonth() + 1 == 12) {
                            date.setFullYear(date.getFullYear() + 1);
                            date.setMonth(0);
                        }
                        else {
                            date.setMonth(date.getMonth() + 1);
                        }
                        this.editMessageReplyMarkupCalendar(date, ctx, additionalPayload);
                        break;
                    case '-':
                        date = new Date(code[1]);
                        if (date.getMonth() - 1 == -1) {
                            date.setFullYear(date.getFullYear() - 1);
                            date.setMonth(11);
                        }
                        else {
                            date.setMonth(date.getMonth() - 1);
                        }
                        this.editMessageReplyMarkupCalendar(date, ctx, additionalPayload);
                        break;
                    case '0':
                        if (this.options.close_calendar === true && this.options.time_selector_mod === false) {
                            this.deleteMessage(ctx);
                            this.chats.delete(ctx.callbackQuery.message.chat.id);
                        }
                        if (this.options.time_selector_mod === true) {
                            this.editMessageReplyMarkupTime(dayjs(code[1]).format('YYYY-MM-DD HH:mm'), ctx, true, additionalPayload);
                        }
                        else {
                            const require = createRequire(import.meta.url);
                            require('dayjs/locale/' + this.options.language);
                            res = dayjs(code[1]).locale(this.options.language).format(this.options.date_format);
                        }
                }
            }
            else if (code[0] == 't') {
                switch (code[2]) {
                    case 'back':
                        date = new Date(code[1]);
                        date.setDate(1);
                        this.editMessageReplyMarkupCalendar(date, ctx, additionalPayload);
                        break;
                    case '1+':
                        this.editMessageReplyMarkupTime(dayjs(code[1]), ctx, true, additionalPayload);
                        break;
                    case '1-':
                        date = dayjs(code[1]).subtract(16 * parseInt(this.options.time_step.slice(0, -1)), this.options.time_step.slice(-1));
                        this.editMessageReplyMarkupTime(date, ctx, true, additionalPayload);
                        break;
                    case '0+':
                        this.editMessageReplyMarkupTime(dayjs(code[1]), ctx, false, additionalPayload);
                        break;
                    case '0-':
                        date = dayjs(code[1]).subtract(16 * parseInt(this.options.time_step.slice(0, -1)), this.options.time_step.slice(-1));
                        this.editMessageReplyMarkupTime(date, ctx, false, additionalPayload);
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
            return { res, additionalPayload };
        };
        this.editMessageReplyMarkupCalendar = (date, ctx, additionalPayload) => {
            ctx.editMessageReplyMarkup(this.replyMarkupObject(this.createNavigationKeyboard(date, additionalPayload)));
        };
        this.editMessageReplyMarkupTime = (date, ctx, from_calendar, additionalPayload) => {
            const menu = this.replyMarkupObject(this.createTimeSelector(date, from_calendar, additionalPayload));
            ctx.editMessageReplyMarkup(menu);
        };
    }
    async startNavCalendarWithAvailableDates(ctx, availableDates, additionalPayload) {
        const now = new Date();
        now.setDate(1);
        now.setHours(0);
        now.setMinutes(0);
        now.setSeconds(0);
        this.updateAvailableDatesTimestamp(availableDates);
        this.sendMessageCalendar(this.replyMarkupObject(this.createNavigationKeyboard(now, additionalPayload)), ctx);
    }
    createNavigationKeyboard(date, additionalPayload) {
        let column, row;
        const keyboard = {};
        const cd = this.howMuchDays(date.getFullYear(), date.getMonth() + 1);
        const cr = this.colRowNavigation(date, cd);
        keyboard.resize_keyboard = true;
        keyboard.inline_keyboard = [];
        keyboard.inline_keyboard.push([{}]);
        const now = new Date();
        now.setDate(1);
        now.setHours(0);
        now.setMinutes(0);
        now.setSeconds(0);
        keyboard.inline_keyboard[0][0] = {
            text: lang.month3[this.options.language][date.getMonth()] + ' ' + date.getFullYear(),
            callback_data: ' ',
        };
        keyboard.inline_keyboard.push([{}, {}, {}, {}, {}, {}, {}]);
        for (row = 0; row < 7; row++) {
            keyboard.inline_keyboard[1][row] = {
                text: lang.week[this.options.language][this.weekDaysButtons(row)],
                callback_data: ' ',
            };
        }
        let d = 1;
        for (column = 2; column <= cr - 2; column++) {
            keyboard.inline_keyboard.push([{}, {}, {}, {}, {}, {}, {}]);
            for (row = 0; row < 7; row++) {
                if ((column == 2 && row < this.startWeekDay(date.getDay())) || d > cd) {
                    keyboard.inline_keyboard[column][row] = { text: ' ', callback_data: ' ' };
                }
                else {
                    if ((!this.options.start_date ||
                        (this.options.start_date &&
                            dayjs(date).date(d).hour(0).diff(dayjs(this.options.start_date).hour(0), 'day') >=
                                0)) &&
                        (!this.options.stop_date ||
                            (this.options.stop_date &&
                                dayjs(this.options.stop_date).hour(0).diff(dayjs(date).date(d).hour(0), 'day') >= 0))) {
                        const dateNow = +Date.now();
                        const isCurrentDateAvailable = this.availableDatesTimestamp.find(timestamp => {
                            const availableDate = dayjs(timestamp);
                            const currentDateFromStart = dayjs(date);
                            const isCurrentOrFutureDate = timestamp - dateNow >= 0;
                            return (availableDate.year() === currentDateFromStart.year() &&
                                availableDate.month() === currentDateFromStart.month() &&
                                availableDate.date() === d &&
                                isCurrentOrFutureDate);
                        });
                        keyboard.inline_keyboard[column][row] = {
                            text: isCurrentDateAvailable ? `${d}` : '-',
                            callback_data: isCurrentDateAvailable
                                ? `n_${date.getFullYear()}-${this.twoDigits(date.getMonth() + 1)}-${this.twoDigits(d)}_0_${additionalPayload}`
                                : ' ',
                        };
                    }
                    else {
                        keyboard.inline_keyboard[column][row] = { text: ' ', callback_data: ' ' };
                    }
                    d++;
                }
            }
        }
        keyboard.inline_keyboard.push([{}, {}, {}]);
        if ((!this.options.start_date ||
            (this.options.start_date &&
                Math.round(dayjs(date).date(1).diff(dayjs(this.options.start_date).date(1), 'month', true)) > 0)) &&
            Math.round(dayjs(date).date(1).diff(dayjs(now).date(1), 'month', true)) > 0) {
            keyboard.inline_keyboard[cr - 1][0] = {
                text: '<',
                callback_data: 'n_' + dayjs(date).format('YYYY-MM') + '_-' + `_${additionalPayload}`,
            };
        }
        else {
            keyboard.inline_keyboard[cr - 1][0] = { text: ' ', callback_data: ' ' };
        }
        keyboard.inline_keyboard[cr - 1][1] = { text: ' ', callback_data: ' ' };
        if (!this.options.stop_date ||
            (this.options.stop_date &&
                Math.round(dayjs(this.options.stop_date).date(1).diff(dayjs(date).date(1), 'month', true)) > 0)) {
            keyboard.inline_keyboard[cr - 1][2] = {
                text: '>',
                callback_data: 'n_' + dayjs(date).format('YYYY-MM') + '_+' + `_${additionalPayload}`,
            };
        }
        else {
            keyboard.inline_keyboard[cr - 1][2] = { text: ' ', callback_data: ' ' };
        }
        return keyboard;
    }
    createTimeSelector(date = 'undefined', from_calendar = false, additionalPayload) {
        let i, j;
        let start;
        const time_range = this.options.time_range.split('-');
        let datetime = date === 'undefined' ? new Date(2100, 1, 1, 0, 0, 0) : new Date(date);
        const type = this.options.time_step.slice(-1);
        const step = this.options.time_step.slice(0, -1);
        const keyboard = {};
        keyboard.resize_keyboard = true;
        keyboard.inline_keyboard = [];
        let d = 0, flag_start = 0, flag_stop = 0, fc = 0;
        if (from_calendar === true) {
            keyboard.inline_keyboard.push([{}, {}, {}]);
            keyboard.inline_keyboard[d][0] = {
                text: lang.back[this.options.language],
                callback_data: 't_' + dayjs(datetime).format('YYYY-MM-DD') + '_back' + `_${additionalPayload}`,
            };
            keyboard.inline_keyboard[d][1] = { text: dayjs(datetime).format('YYYY-MM-DD'), callback_data: ' ' };
            keyboard.inline_keyboard[d][2] = { text: ' ', callback_data: ' ' };
            fc++;
            d++;
        }
        if (dayjs(datetime).format('HH') < time_range[0].split(':')[0] ||
            (dayjs(datetime).format('HH') == time_range[0].split(':')[0] &&
                dayjs(datetime).format('mm') <= time_range[0].split(':')[1])) {
            datetime.setHours(parseInt(time_range[0].split(':')[0]));
            datetime.setMinutes(parseInt(time_range[0].split(':')[1]));
            datetime.setSeconds(0);
            flag_start++;
        }
        const stop = new Date(datetime);
        stop.setHours(parseInt(time_range[1].split(':')[0]));
        stop.setMinutes(parseInt(time_range[1].split(':')[1]));
        stop.setSeconds(0);
        for (i = d; i < d + 4; i++) {
            keyboard.inline_keyboard.push([{}, {}, {}, {}]);
            for (j = 0; j < 4; j++) {
                if (i === d && j === 0) {
                    start = new Date(datetime);
                }
                const dateNow = +Date.now();
                const isCurrentDateTimeAvailable = this.availableDatesTimestamp.find(timestamp => {
                    const availableDate = dayjs(timestamp);
                    const currentDate = dayjs(datetime);
                    const isDateAvailable = availableDate.year() === currentDate.year() &&
                        availableDate.month() === currentDate.month() &&
                        availableDate.date() === currentDate.date();
                    const isTimeAvailable = `${availableDate.hour()}:${availableDate.minute()}` ===
                        `${currentDate.hour()}:${currentDate.minute()}`;
                    const isCurrentOrFutureTime = timestamp - dateNow >= 0;
                    return isDateAvailable && isTimeAvailable && isCurrentOrFutureTime;
                });
                keyboard.inline_keyboard[i][j] =
                    dayjs(stop).diff(dayjs(datetime).format('YYYY-MM-DD HH:mm'), type) < 0
                        ? { text: ' ', callback_data: ' ' }
                        : {
                            text: isCurrentDateTimeAvailable ? dayjs(datetime).format('HH:mm') : '-',
                            callback_data: isCurrentDateTimeAvailable
                                ? 't_' + dayjs(datetime).format('YYYY-MM-DD HH:mm') + '_0' + `_${additionalPayload}`
                                : ' ',
                        };
                datetime = new Date(dayjs(datetime)
                    .add(parseInt(step), type)
                    .format('YYYY-MM-DD HH:mm'));
            }
            if (dayjs(stop).diff(dayjs(datetime).format('YYYY-MM-DD HH:mm'), type) < 0) {
                flag_stop++;
                i++;
                break;
            }
        }
        d = i;
        keyboard.inline_keyboard.push([{}, {}, {}]);
        keyboard.inline_keyboard[d][0] =
            flag_start === 1
                ? { text: ' ', callback_data: ' ' }
                : {
                    text: '<',
                    callback_data: 't_' + dayjs(start).format('YYYY-MM-DD HH:mm') + '_' + fc + '-' + `_${additionalPayload}`,
                };
        keyboard.inline_keyboard[d][1] = { text: ' ', callback_data: ' ' };
        keyboard.inline_keyboard[d][2] =
            flag_stop === 1
                ? { text: ' ', callback_data: ' ' }
                : {
                    text: '>',
                    callback_data: 't_' + dayjs(datetime).format('YYYY-MM-DD HH:mm') + '_' + fc + '+' + `_${additionalPayload}`,
                };
        return keyboard;
    }
}
export default TgInlineCalendar;
//# sourceMappingURL=calendar.js.map