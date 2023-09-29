import { INLINE_QUERY, ServiceByOption } from './constants.js';
import { createInlineKeyboard, makeInlineQueriesWithOptions } from './utils.js';

const appointmentData = [['Записаться', INLINE_QUERY.makeAppointment]];
const servicesData = makeInlineQueriesWithOptions(ServiceByOption, INLINE_QUERY.selectService);

export const selectServiceKeyboard = createInlineKeyboard(servicesData);
export const makeAppointmentKeyboard = createInlineKeyboard(appointmentData);
