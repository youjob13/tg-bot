import { User } from 'grammy/types';

export const getUserFullName = (user: User) => {
    return `${user.first_name} ${user.last_name}`.trim();
};

export const USERNAME_IS_ABSENT = 'У пользователя отсутствует username' as const;

export const getUsernameLink = (username: User['username'], displayName?: string) => {
    return username != null
        ? `<a href="https://t.me/@${username}">${displayName ?? username}</a>`
        : displayName ?? USERNAME_IS_ABSENT;
};
