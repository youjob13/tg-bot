export const TG_BOT_TOKEN = process.env.TG_BOT_TOKEN ?? '';
export const PORT = process.env.PORT ?? '6541';

export const LOGGER_OPTIONS = {
    APP_NAME: process.env.APP_NAME,
    LEVEL: (process.env.LOG_LEVEL || 'info') as 'error' | 'info' | undefined,
};
