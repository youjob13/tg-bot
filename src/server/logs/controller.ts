import { bot } from '@ann-nails/bot';
import * as Config from '@ann-nails/config';
import express from 'express';
import asyncHandler from 'express-async-handler';
import { StatusCodes } from 'http-status-codes';

const router = express.Router();

router.post(
    '/',
    asyncHandler(async (req, res) => {
        const { message } = req.body;

        await bot.api.sendMessage(Config.ADMIN_ID, message ?? 'Admin page is activated');

        res.sendStatus(StatusCodes.OK);
    }),
);

export default router;
