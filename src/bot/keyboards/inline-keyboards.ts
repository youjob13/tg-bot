import { InlineQuery, ServiceByOption } from './constants.js';
import { KeyboardData } from './models.js';
import { createInlineKeyboard, makeInlineQueriesWithOptions } from './utils.js';

const appointmentData: KeyboardData = [['Записаться', InlineQuery.MakeAppointment]];
const servicesData: KeyboardData = makeInlineQueriesWithOptions(ServiceByOption, InlineQuery.SelectService);

export const selectServiceKeyboard = createInlineKeyboard(servicesData);
export const makeAppointmentKeyboard = createInlineKeyboard(appointmentData);
