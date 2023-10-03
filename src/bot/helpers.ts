import type { Chat, User } from 'grammy/types';

export const getUserFullName = (user: User | Chat.PrivateChat) => {
    return `${user.first_name} ${user.last_name ?? ''}`.trim();
};

export const getUsernameLink = (username: User['username'], displayName: string) => {
    return username != null ? `@${username}` : displayName;
};
