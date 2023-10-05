import { Composer } from 'grammy';
const composer = new Composer();
// composer.command('test', async ctx => {
//     console.log('test', ctx.msg.from.id, ADMIN_ID);
//     if (ctx.msg.from.id === ADMIN_ID) {
//         const availableDates = await scheduleCollection.getAvailableDates();
//         await ctx.reply(availableDates.map(timestamp => dayjs(timestamp).format('YYYY-MM-DD HH:mm')).join('\n'));
//     }
// });
// composer.on('message', async ctx => {});
export default composer;
//# sourceMappingURL=modify-data.js.map