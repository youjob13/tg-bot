import { servicesCollection } from '@ann-nails/db';
import * as DTO from '@ann-nails/dto';
import express from 'express';
import asyncHandler from 'express-async-handler';
import { StatusCodes } from 'http-status-codes';

const router = express.Router();

router.get(
    '/',
    asyncHandler(async (req, res) => {
        const services = await servicesCollection.getServices();

        res.send(services);
    }),
);

router.post(
    '/',
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
