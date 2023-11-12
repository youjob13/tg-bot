import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';

import { routes } from './router.js';

const server = express();

server.use(cors());
server.use(bodyParser.json());
routes(server);

export default server;
