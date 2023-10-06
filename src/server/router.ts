import express from 'express';
import asyncHandler from 'express-async-handler';
import { DateTime } from 'luxon';

import type * as DTO from '../../dto/index.js';
import { scheduleCollection } from '../db/handlers/index.js';

const formatStringDateToTimestamp = (date: string) => {
    return DateTime.fromFormat(date, 'yyyy-MM-dd HH:mm', { zone: 'Europe/Berlin' }).toMillis();
};

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

        res.sendStatus(200);
    }),
);

export default router;
