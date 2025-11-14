import { Router } from 'express';
import queryRoutes from './queryRoutes';

const router = Router();

router.use('/queries', queryRoutes);

export default router;
