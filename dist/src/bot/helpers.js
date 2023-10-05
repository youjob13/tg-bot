export const getUserFullName = (user) => {
    return `${user.first_name} ${user.last_name ?? ''}`.trim();
};
export const getUsernameLink = (username, displayName) => {
    return username != null ? `@${username}` : displayName;
};
//# sourceMappingURL=helpers.js.map