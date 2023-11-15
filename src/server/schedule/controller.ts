import express from 'express';
import asyncHandler from 'express-async-handler';
import { StatusCodes } from 'http-status-codes';

import { requestCollection, scheduleCollection } from '../../db/handlers/index.js';
import { apiLogger } from '../../logger.js';
import { formatStringDateToTimestamp } from '../../shared/utils.js';
import { getBookedRequests } from './helpers.js';

const router = express.Router();

router.post(
    '/',
    asyncHandler(async (req, res) => {
        const { dates } = req.body as { dates: string[] };

        const formattedDates = dates.map(date => formatStringDateToTimestamp(date.trim()));

        const datesFromDB = await scheduleCollection.getDates();

        const datesToRemove = datesFromDB.filter(
            d => !formattedDates.includes(d.timestamp) && (d.isBooked === false || d.isBooked == null),
        );
        const datesToInsert = formattedDates
            .filter(timestamp => !datesFromDB.find(d => d.timestamp === timestamp))
            .map(timestamp => ({ timestamp }));

        if (datesToRemove.length > 0) {
            apiLogger.info('Dates were removed', datesToRemove);
            await scheduleCollection.removeDates(datesToRemove);
        }
        if (datesToInsert.length > 0) {
            apiLogger.info('Dates were inserted', datesToInsert);
            await scheduleCollection.insertDates(datesToInsert);
        }

        res.sendStatus(StatusCodes.OK);
    }),
);

router.get(
    '/',
    asyncHandler(async (req, res) => {
        const dates = await scheduleCollection.getDates();

        res.send(dates);
    }),
);

router.get(
    '/booked',
    asyncHandler(async (req, res) => {
        const bookedRequests = await getBookedRequests({ scheduleCollection, requestCollection });
        const nonApprovedRequests = bookedRequests.filter(request => request.isApproved === false);

        res.send(nonApprovedRequests);
    }),
);

router.get(
    '/approved',
    asyncHandler(async (req, res) => {
        const bookedRequests = await getBookedRequests({ scheduleCollection, requestCollection });
        const approvedRequests = bookedRequests.filter(request => request.isApproved);

        res.send(approvedRequests);
    }),
);

router.get(
    '/available',
    asyncHandler(async (req, res) => {
        const dates = await scheduleCollection.getAvailableDates();

        res.send(dates);
    }),
);

export default router;
