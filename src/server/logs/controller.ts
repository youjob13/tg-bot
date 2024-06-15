import express from 'express';
import asyncHandler from 'express-async-handler';
import { StatusCodes } from 'http-status-codes';

import bot from '../../../packages/bot/lib/bot.js';
import { ADMIN_ID } from '../../../packages/config/lib/config.js';

const router = express.Router();

router.post(
    '/',
    asyncHandler(async (req, res) => {
        const { message } = req.body;

        await bot.api.sendMessage(ADMIN_ID, message ?? 'Admin page is activated');

        res.sendStatus(StatusCodes.OK);
    }),
);

export default router;
