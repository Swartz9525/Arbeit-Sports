import { Router } from 'express';
import { syncCart, getCart } from '../controllers/cartController';
import { protect } from '../middlewares/auth';

const router = Router();

router.route('/')
  .get(protect, getCart)
  .post(protect, syncCart);

export default router;
