import { InlineQuery } from './constants.js';
import { KeyboardData } from './models.js';
import { createInlineKeyboard } from './utils.js';

const appointmentData: KeyboardData = [['Записаться', InlineQuery.MakeAppointment]];

export const makeAppointmentKeyboard = createInlineKeyboard(appointmentData);
