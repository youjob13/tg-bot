import express from 'express';
import asyncHandler from 'express-async-handler';
import { StatusCodes } from 'http-status-codes';

import * as DTO from '../../dto/index.js';
import { requestCollection, scheduleCollection, servicesCollection } from '../db/handlers/index.js';
import { apiLogger } from '../logger.js';
import { formatStringDateToTimestamp } from '../shared/utils.js';

const router = express.Router();
router.post(
    '/api/schedule',
    asyncHandler(async (req, res) => {
        const { dates } = req.body as { dates: string[] };

        const formattedDates = dates.map(date => formatStringDateToTimestamp(date.trim()));

        const datesFromDB = await scheduleCollection.getDates();

        const datesToRemove = datesFromDB.filter(d => !formattedDates.includes(d.timestamp));
        const datesToInsert = formattedDates
            .filter(timestamp => !datesFromDB.find(d => d.timestamp === timestamp))
            .map(timestamp => ({ timestamp, uniqueId: null }));

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
    '/api/schedule',
    asyncHandler(async (req, res) => {
        const dates = await scheduleCollection.getDates();

        res.send(dates);
    }),
);

router.get(
    '/api/schedule/booked',
    asyncHandler(async (req, res) => {
        const dates = await scheduleCollection.getBookedDates();

        const customerIds = dates.filter(date => !!date.uniqueId).map(date => Number(date.uniqueId.split('|')[0]));

        const bookedRequests = await requestCollection.getCustomersByChatIds(customerIds);

        const nonApprovedRequests = bookedRequests.filter(request => request.isApproved === false);

        res.send(nonApprovedRequests);
    }),
);

router.get(
    '/api/schedule/approved',
    asyncHandler(async (req, res) => {
        const dates = await scheduleCollection.getBookedDates();

        const customerIds = dates.filter(date => !!date.uniqueId).map(date => Number(date.uniqueId.split('|')[0]));

        const bookedRequests = await requestCollection.getCustomersByChatIds(customerIds);

        const approvedRequests = bookedRequests.filter(request => request.isApproved);

        res.send(approvedRequests);
    }),
);

router.get(
    '/api/schedule/available',
    asyncHandler(async (req, res) => {
        const dates = await scheduleCollection.getAvailableDates();

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

router.put(
    '/api/request/:date',
    asyncHandler(async (req, res) => {
        const { date } = req.params;

        await Promise.all([scheduleCollection.unBookDate(Number(date)), requestCollection.removeRequest(Number(date))]);

        res.sendStatus(StatusCodes.OK);
    }),
);

export default router;
