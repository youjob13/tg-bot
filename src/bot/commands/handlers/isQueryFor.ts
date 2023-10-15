import { Context } from 'grammy';

import { calendar } from '../../bot.js';
import { InlineQuery } from '../../keyboards/index.js';

export const isQueryFor = (ctx: Context) => {
    const callbackQueryData = ctx.callbackQuery.data;

    const isMakeAppointmentQuery = callbackQueryData.includes(InlineQuery.MakeAppointment);

    if (isMakeAppointmentQuery) {
        return InlineQuery.MakeAppointment;
    }

    const isSelectServiceQuery = callbackQueryData.includes(InlineQuery.SelectService);

    if (isSelectServiceQuery) {
        return InlineQuery.SelectService;
    }

    const isSelectDateQuery = ctx.msg?.message_id == calendar.chats.get(ctx.chat?.id);

    if (isSelectDateQuery) {
        return InlineQuery.SelectDate;
    }

    const isApproveNewRequestQuery = callbackQueryData.includes(InlineQuery.ApproveNewRequest);

    if (isApproveNewRequestQuery) {
        return InlineQuery.ApproveNewRequest;
    }

    const isRejectNewRequestQuery = callbackQueryData.includes(InlineQuery.RejectNewRequest);

    if (isRejectNewRequestQuery) {
        return InlineQuery.RejectNewRequest;
    }

    const isRejectPartialNewRequestQuery = callbackQueryData.includes(InlineQuery.RejectPartialNewRequest);

    if (isRejectPartialNewRequestQuery) {
        return InlineQuery.RejectPartialNewRequest;
    }
};
