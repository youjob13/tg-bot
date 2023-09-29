declare module 'telegram-inline-calendar' {
    import { Api, Bot, Context, RawApi } from 'grammy';

    export interface ICalendarOptions {
        date_format: string; //Date time result format
        language: string; //Language (en/es/de/es/fr/it/tr/id)
        close_calendar?: boolean; //Close calendar after date selection, default true
        bot_api: 'grammy'; //Telegram bot library
        start_week_day?: 0; //First day of the week(Sunday - `0`, Monday - `1`, Tuesday - `2` and so on)
        time_selector_mod?: boolean; //Enable time selection after a date is selected.
        time_range?: string; //Allowed time range in "HH:mm-HH:mm" format
        time_step?: string; //Time step in the format "<Time step><m | h>"
        start_date?: string; //Minimum date of the calendar in the format "YYYY-MM-DD"
        stop_date?: string; //Maximum date of the calendar in the format "YYYY-MM-DD"
        custom_start_msg?: string; //Text of the message sent with the calendar/time selector
    }

    export class Calendar {
        public chats: Map<any, any>;
        constructor(bot: Bot<Context, Api<RawApi>>, options: ICalendarOptions);

        public startNavCalendar(ctx: any): Promise<void>;
        public clickButtonCalendar(ctx: any): string | number;
        public createNavigationKeyboard(date: Date): any;
    }
}
