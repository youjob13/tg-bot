import type { BotCommand } from 'grammy/types';

export const COMMAND_LIST: readonly BotCommand[] = [
    { command: 'start', description: 'Start the bot' },
    { command: 'help', description: 'How to use the bot?' },
    // { command: 'stop', description: 'Stop the bot' },
    // { command: 'cancel', description: 'Cancel requested appointment' },
];
