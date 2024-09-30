// todo: ADMIN_ID shouldn't be hardcoded
export const ADMIN_ID = 934785648; // me
export const ADMIN_ID_2 = 389718650; // Anya

export const ENV = process.env.ENV ?? 'development';

export const isDev = ENV === 'development';

export const TG_BOT = {
    ADMIN: {
        USER_NAME: isDev ? ADMIN_ID : process.env.TG_BOT_ADMIN_USER_NAME ?? '',
    },
    TOKEN: process.env.TG_BOT_TOKEN ?? '',
    LANGUAGE: process.env.TG_BOT_LANGUAGE ?? 'ru',
};

export const PORT = process.env.PORT ?? '6541';

export const LOGGER_OPTIONS = {
    APP_NAME: process.env.APP_NAME,
    LEVEL: (process.env.LOG_LEVEL || 'info') as 'error' | 'info' | undefined,
};

export const MONGO_DB = {
    USER: process.env.MONGO_USER ?? '',
    PASS: process.env.MONGO_PASS ?? '',
    NAME: process.env.MONGO_DB_NAME ?? 'data',
    COLLECTION: {
        REQUESTS: process.env.REQUESTS_COLLECTION ?? 'requests_test',
        SCHEDULE: process.env.SCHEDULE_COLLECTION ?? 'schedule_test',
        SERVICES: process.env.SERVICES ?? 'services',
        MESSAGES_TO_USERS: process.env.MESSAGES_TO_USERS ?? 'messages_to_users',
    },
};
// 172.22.49.34
export const MONGO_DB_CONNECTION_STRING = isDev
    ? 'mongodb://localhost:27017/test'
    : `mongodb+srv://${MONGO_DB.USER}:${MONGO_DB.PASS}@cluster-base.knd90rj.mongodb.net/?retryWrites=true&w=majority`;

export const TZ = process.env.APP_TZ ?? 'Europe/Berlin';
