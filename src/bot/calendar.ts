import type { Api, Bot, Context, RawApi } from 'grammy';
// @ts-ignore
import { Calendar, type ICalendarOptions } from 'telegram-inline-calendar';

class TgInlineCalendar extends Calendar implements Calendar {
    constructor(bot: Bot<Context, Api<RawApi>>, options: ICalendarOptions) {
        super(bot, options);
    }

    // public createNavigationKeyboard(date: Date) {
    //     super.createNavigationKeyboard(date);
    //     // const cnk: any = {};
    //     // cnk.resize_keyboard = true;
    //     // cnk.inline_keyboard = [];
    //     // cnk.inline_keyboard.push([{}]);
    //     // cnk.inline_keyboard[0][0] = { text: '<<', callback_data: 'n_' };
    //     // return cnk;
    // }
}

export default TgInlineCalendar;
