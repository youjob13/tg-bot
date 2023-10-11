import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';

import router from './router.js';

const server = express();

server.use(cors());
server.use(bodyParser.json());
server.use(router);

export default server;
