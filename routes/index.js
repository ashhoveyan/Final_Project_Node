import { Router } from 'express';

import usersRoutes from './usersRouters.js';

const router = Router();

router.use('/users', usersRoutes);

export default router;