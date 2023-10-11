import express from 'express';
import asyncHandler from 'express-async-handler';
import { StatusCodes } from 'http-status-codes';

import { scheduleTestCollection } from '../db/handlers/index.js';
import { apiLogger } from '../logger.js';
import { formatStringDateToTimestamp } from '../shared/utils.js';

const router = express.Router();
router.post(
    '/api/schedule',
    asyncHandler(async (req, res) => {
        const { dates } = req.body as { dates: string[] };

        const formattedDates = dates.map(date => formatStringDateToTimestamp(date.trim()));

        const datesFromDB = await scheduleTestCollection.getDates();

        const datesToRemove = datesFromDB.filter(d => !formattedDates.includes(d.timestamp));
        const datesToInsert = formattedDates
            .filter(timestamp => !datesFromDB.find(d => d.timestamp === timestamp))
            .map(timestamp => ({ timestamp, uniqueId: null }));

        if (datesToRemove.length > 0) {
            apiLogger.info('Dates were removed', datesToRemove);
            await scheduleTestCollection.removeDates(datesToRemove);
        }
        if (datesToInsert.length > 0) {
            apiLogger.info('Dates were inserted', datesToInsert);
            await scheduleTestCollection.insertDates(datesToInsert);
        }

        res.sendStatus(StatusCodes.OK);
    }),
);
router.get(
    '/api/schedule',
    asyncHandler(async (req, res) => {
        const dates = await scheduleTestCollection.getDates();

        res.json(dates);
    }),
);

export default router;
