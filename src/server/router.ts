import express from 'express';
import asyncHandler from 'express-async-handler';
import { StatusCodes } from 'http-status-codes';

import type * as DTO from '../../dto/index.js';
import { scheduleCollection } from '../db/handlers/index.js';
import { formatStringDateToTimestamp } from '../shared/utils.js';

const router = express.Router();
router.post(
    '/api/schedule',
    asyncHandler(async (req, res) => {
        const { dates } = req.body;

        const datesFromDB = await scheduleCollection.getDates();

        const formattedDates: DTO.ISchedule[] = dates
            .map(date => ({
                timestamp: formatStringDateToTimestamp(date.trim()),
                uniqueId: null,
            }))
            .filter(({ timestamp }) => !datesFromDB.some(d => d.timestamp === timestamp));

        if (formattedDates.length > 0) {
            await scheduleCollection.setDates(formattedDates);
        }

        res.sendStatus(StatusCodes.CREATED);
    }),
);

export default router;
