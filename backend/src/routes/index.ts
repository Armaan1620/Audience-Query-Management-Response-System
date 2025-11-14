import { Router } from 'express';
import queryRoutes from './queryRoutes';
import { analyticsController } from '../controllers/analyticsController';

const router = Router();

router.use('/queries', queryRoutes);
router.get('/analytics/summary', analyticsController.summary);

export default router;
