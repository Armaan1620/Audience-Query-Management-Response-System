import { Router } from 'express';
import { queryController } from '../controllers/queryController';

const router = Router();

router.get('/', queryController.list);
router.get('/:id', queryController.get);
router.post('/', queryController.create);

export default router;
