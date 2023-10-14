import express from 'express';
import asyncHandler from 'express-async-handler';
import { StatusCodes } from 'http-status-codes';

import * as DTO from '../../dto/index.js';
import { scheduleTestCollection, servicesCollection } from '../db/handlers/index.js';
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

        res.send(dates);
    }),
);

router.get(
    '/api/schedule/booked',
    asyncHandler(async (req, res) => {
        const dates = await scheduleTestCollection.getBookedDates();

        res.send(dates);
    }),
);

router.get(
    '/api/schedule/available',
    asyncHandler(async (req, res) => {
        const dates = await scheduleTestCollection.getAvailableDates();

        res.send(dates);
    }),
);

router.get(
    '/api/services',
    asyncHandler(async (req, res) => {
        const services = await servicesCollection.getServices();

        res.send(services);
    }),
);

router.post(
    '/api/services',
    asyncHandler(async (req, res) => {
        const { services: servicesEntries } = req.body as { services: DTO.IService[] };
        const servicesFromDB = await servicesCollection.getServices();

        const servicesToRemove = servicesFromDB.filter(service => !servicesEntries.find(s => s.key === service.key));

        const removedServicesPromises = servicesCollection.removeServices(servicesToRemove);
        const updatedServicesPromises = servicesCollection.updateServices(servicesEntries);

        await Promise.all([removedServicesPromises, updatedServicesPromises]);

        res.sendStatus(StatusCodes.OK);
    }),
);

export default router;
