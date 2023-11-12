import callbackQuery from './callback-query.js';
// import cancelRequest from './cancel-appointment.js';
import appointment from './schedule-appointment.js';
import start from './start.js';

const handlers = [start, /* cancelRequest,*/ appointment, callbackQuery];

export default handlers;
