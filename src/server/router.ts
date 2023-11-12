import type express from 'express';

import logsRouter from './logs/controller.js';
import requestRouter from './request/controller.js';
import scheduleRouter from './schedule/controller.js';
import serviceRouter from './service/controller.js';

export const routes = (server: express.Express) => {
    server.use('/api/schedule', scheduleRouter);
    server.use('/api/request', requestRouter);
    server.use('/api/services', serviceRouter);
    server.use('/api/logs', logsRouter);
};
