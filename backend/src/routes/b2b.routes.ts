import { Router } from 'express';
import { submitB2BRequest, getB2BRequests } from '../controllers/b2b.controller';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

router.post('/request', submitB2BRequest);
router.get('/requests', authenticate, requireAdmin, getB2BRequests);

export default router;
