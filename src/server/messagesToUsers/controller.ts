import express from 'express';
import asyncHandler from 'express-async-handler';

import { messagesToUsersCollection } from '../../../packages/db/lib/handlers/index.js';

const router = express.Router();

router.get(
    '/:key',
    asyncHandler(async (req, res) => {
        const { key } = req.params;
        const location = await messagesToUsersCollection.getLocation(key);

        res.send(location);
    }),
);

router.put(
    '/:key',
    asyncHandler(async (req, res) => {
        const { key } = req.params;
        const locationData = req.body;

        if (key !== 'location') {
            res.status(400).send(`Invalid key: ${key}`);
            return;
        }

        const location = await messagesToUsersCollection.updateLocation(locationData);

        res.send(location);
    }),
);

export default router;
