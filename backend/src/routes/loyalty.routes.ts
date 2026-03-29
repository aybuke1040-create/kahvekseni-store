import { Router } from 'express';
import { getLoyalty, getTierInfo } from '../controllers/loyalty.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.get('/tiers', getTierInfo);
router.get('/', authenticate, getLoyalty);

export default router;
