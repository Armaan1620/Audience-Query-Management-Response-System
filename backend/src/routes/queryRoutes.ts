import { Router } from 'express';
import { queryController } from '../controllers/queryController';

const router = Router();

router.get('/', queryController.list);
router.get('/:id', queryController.get);
router.post('/', queryController.create);
router.patch('/:id/status', queryController.updateStatus);
router.patch('/:id/assign', queryController.assign);
router.get('/:id/activities', queryController.activities);

export default router;
