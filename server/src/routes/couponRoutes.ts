import { Router } from 'express';
import { validateCoupon, createCoupon } from '../controllers/couponController';
import { protect, adminOnly } from '../middlewares/auth';

const router = Router();

router.post('/validate', validateCoupon);
router.post('/', protect, adminOnly, createCoupon);

export default router;
