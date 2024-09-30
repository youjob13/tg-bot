import callbackQuery from './callback-query.js';
import cancelRequest from './cancel-appointment.js';
import help from './help.js';
import appointment from './schedule-appointment.js';
import start from './start.js';

const handlers = [start, help, cancelRequest, appointment, callbackQuery];

export default handlers;
