import type { BotCommand } from 'grammy/types';

// todo: ADMIN_ID shouldn't be hardcoded
export const ADMIN_ID = 934785648; // me
export const ADMIN_ID_2 = 389718650; // Anya

export const COMMAND_LIST: readonly BotCommand[] = [
    { command: 'start', description: 'Start the bot' },
    { command: 'help', description: 'Show help text' },
    { command: 'stop', description: 'Stop the bot' },
    // { command: 'cancel', description: 'Cancel requested appointment' },
];
