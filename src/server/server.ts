import bodyParser from 'body-parser';
import express from 'express';

import router from './router.js';

const server = express();

server.use(bodyParser.json());
server.use(router);

export default server;
