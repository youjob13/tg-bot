import { BotCommand } from 'grammy/types';

export const COMMAND_LIST: readonly BotCommand[] = [
    { command: 'start', description: 'Start the bot' },
    { command: 'help', description: 'Show help text' },
    { command: 'stop', description: 'Stop the bot' },
];
