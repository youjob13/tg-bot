import express from 'express';
import asyncHandler from 'express-async-handler';
import { StatusCodes } from 'http-status-codes';

import bot from '../../bot/bot.js';
import { ADMIN_ID } from '../../bot/commands/constants.js';

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
