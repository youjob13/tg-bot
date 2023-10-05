import { InlineQuery, ServiceByOption } from './constants.js';
import { createInlineKeyboard, makeInlineQueriesWithOptions } from './utils.js';
const appointmentData = [['Записаться', InlineQuery.MakeAppointment]];
const servicesData = makeInlineQueriesWithOptions(ServiceByOption, InlineQuery.SelectService);
export const selectServiceKeyboard = createInlineKeyboard(servicesData);
export const makeAppointmentKeyboard = createInlineKeyboard(appointmentData);
//# sourceMappingURL=inline-keyboards.js.map