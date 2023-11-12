// import { Composer, Context } from 'grammy';

// import { requestCollection, servicesCollection } from '../../../db/handlers/index.js';
// import { botLogger } from '../../../logger.js';
// import { formatToDate } from '../../../shared/utils.js';
// import { InlineQuery, createInlineKeyboard, makeInlineQueriesWithOptions } from '../../keyboards/index.js';

// const composer = new Composer();

// composer.command('cancel', async ctx => {
//     await ctx.reply(`Вот список твоих записей👇🏼`);

//     const requests = await requestCollection.getRequestsByChatId(ctx.chat.id);

//     const readableRequests = await Promise.all(
//         requests.map(async request => {
//             const selectedService = await servicesCollection.getService(request.serviceType);
//             return {
//                 key: String(request.date),
//                 name: `${formatToDate(request.date)} ${selectedService.name}`,
//             };
//         }),
//     );

//     const cancelRequestData = makeInlineQueriesWithOptions(readableRequests, InlineQuery.CancelRequest);
//     const cancelRequestKeyboard = createInlineKeyboard(cancelRequestData);
//     await ctx.reply('Выбери запись, которую ты хочешь отменить', { reply_markup: cancelRequestKeyboard });
// });

// export const processCancelRequest = async <TContext extends Context>(ctx: TContext) => {
//     try {
//         const [, date] = ctx.callbackQuery.data.split(':');
//         console.log('date', ctx.callbackQuery.data);
//         await ctx.editMessageReplyMarkup(undefined);
//         await ctx.reply(`Запись на <strong>${formatToDate(Number(date))}</strong> отменена`, { parse_mode: 'HTML' });
//     } catch (error) {
//         botLogger.error(`Process Cancel Request`);
//         throw error;
//     }
// };

// export default composer;
