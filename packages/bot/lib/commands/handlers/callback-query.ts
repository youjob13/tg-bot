import { botLogger } from '@ann-nails/logger';
import { Composer } from 'grammy';

import { InlineQuery } from '../../keyboards/index.js';
import { isQueryFor } from '../isQueryFor.js';
// import { processCancelRequest } from './cancel-appointment.js';
import {
    processApproveNewRequest,
    processMakeAppointment,
    processRejectNewRequest,
    processSelectDate,
    processSelectService,
} from './schedule-appointment.js';

const composer = new Composer();

composer.on('callback_query:data', async ctx => {
    try {
        switch (isQueryFor(ctx)) {
            case InlineQuery.MakeAppointment: {
                await processMakeAppointment(ctx);
                break;
            }
            case InlineQuery.SelectService: {
                await processSelectService(ctx);
                break;
            }
            case InlineQuery.SelectDate: {
                await processSelectDate(ctx);
                break;
            }
            case InlineQuery.ApproveNewRequest: {
                await processApproveNewRequest(ctx);
                break;
            }
            case InlineQuery.RejectNewRequest: {
                await processRejectNewRequest(ctx);
                break;
            }
            case InlineQuery.RejectPartialNewRequest: {
                await processRejectNewRequest(ctx, false);
                break;
            }
            // case InlineQuery.CancelRequest: {
            //     await processCancelRequest(ctx);
            //     break;
            // }
        }
    } catch (error) {
        botLogger.error(error, { chatId: ctx.message?.chat.id, fromId: ctx.message?.from.id });
    }
});

export default composer;
