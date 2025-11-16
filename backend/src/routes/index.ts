import { Router } from 'express';
import queryRoutes from './queryRoutes';
import { analyticsController } from '../controllers/analyticsController';
import { adminController } from '../controllers/adminController';
import { assignmentController } from '../controllers/assignmentController';
import { teamsController } from '../controllers/teamsController';
import { settingsController } from '../controllers/settingsController';

const router = Router();

router.use('/queries', queryRoutes);
router.get('/analytics/summary', analyticsController.summary);
router.get('/teams/queries', teamsController.getTeamsWithQueries);
router.delete('/admin/reset', adminController.reset);
router.post('/admin/import', adminController.importDummyQueries);
router.post('/admin/seed-teams', adminController.seedTeams);

// Assignment utility routes
router.post('/assignment/assign/:queryId', assignmentController.assignQuery);
router.post('/assignment/assign-all', assignmentController.assignAll);
router.post('/assignment/reassign/:queryId', assignmentController.reassignQuery);
router.get('/assignment/stats', assignmentController.getStats);
router.post('/assignment/assign-by-filter', assignmentController.assignByFilter);

// Settings routes
router.get('/settings', settingsController.getSettings);
router.put('/settings', settingsController.updateSettings);
router.delete('/settings', settingsController.resetSettings);

export default router;
