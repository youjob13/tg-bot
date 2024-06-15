import express from 'express';
import asyncHandler from 'express-async-handler';
import { StatusCodes } from 'http-status-codes';

import * as DTO from '../../../dto/index.js';
import { servicesCollection } from '../../../packages/db/lib/handlers/index.js';

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
