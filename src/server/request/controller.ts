import express from 'express';
import asyncHandler from 'express-async-handler';
import { StatusCodes } from 'http-status-codes';

import { requestCollection, scheduleCollection } from '../../db/handlers/index.js';

const router = express.Router();

router.put(
    '/:date',
    asyncHandler(async (req, res) => {
        const { date } = req.params;

        await Promise.all([scheduleCollection.unBookDate(Number(date)), requestCollection.removeRequest(Number(date))]);

        res.sendStatus(StatusCodes.OK);
    }),
);

export default router;
