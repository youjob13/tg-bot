import express from 'express';
import asyncHandler from 'express-async-handler';
import { StatusCodes } from 'http-status-codes';

import { requestCollection, scheduleCollection } from '../../../packages/db/lib/handlers/index.js';

const router = express.Router();

router.put(
    '/approved/:date',
    asyncHandler(async (req, res) => {
        const { date } = req.params;
        const { updatedDate } = req.body;

        const isDateAlreadyBooked = !!(await scheduleCollection.getBookedDate(Number(updatedDate)));

        if (isDateAlreadyBooked) {
            res.status(StatusCodes.BAD_REQUEST).send('Date is already booked. Choose another date.');
            return;
        }

        await Promise.all([
            scheduleCollection.unBookDate(Number(date)),
            scheduleCollection.upsertBookedDate(Number(updatedDate)),
            requestCollection.removeRequest(Number(date)),
            requestCollection.upsertApprovedUserRequest(req.body),
        ]);

        res.sendStatus(StatusCodes.OK);
    }),
);

router.put(
    '/:date',
    asyncHandler(async (req, res) => {
        const { date } = req.params;

        await Promise.all([scheduleCollection.unBookDate(Number(date)), requestCollection.removeRequest(Number(date))]);

        res.sendStatus(StatusCodes.OK);
    }),
);

export default router;
