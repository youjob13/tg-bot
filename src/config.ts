export const TG_BOT = {
    ADMIN: {
        USER_NAME: process.env.TG_BOT_ADMIN_USER_NAME ?? '',
    },
    TOKEN: process.env.TG_BOT_TOKEN ?? '',
    LANGUAGE: process.env.TG_BOT_LANGUAGE ?? 'ru',
};

export const PORT = process.env.PORT ?? '6541';

export const LOGGER_OPTIONS = {
    APP_NAME: process.env.APP_NAME,
    LEVEL: (process.env.LOG_LEVEL || 'info') as 'error' | 'info' | undefined,
};
