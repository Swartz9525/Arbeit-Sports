import { Router } from 'express';
import {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  updateOrderStatus,
  getMyOrders,
  getOrders,
  cancelOrder,
} from '../controllers/orderController';
import { protect, adminOnly } from '../middlewares/auth';

const router = Router();

router.route('/')
  .post(protect, addOrderItems)
  .get(protect, adminOnly, getOrders);

router.route('/myorders').get(protect, getMyOrders);

router.route('/:id')
  .get(protect, getOrderById);

router.route('/:id/pay')
  .put(protect, updateOrderToPaid);

router.route('/:id/status')
  .put(protect, adminOnly, updateOrderStatus);

router.route('/:id/cancel')
  .put(protect, cancelOrder);

export default router;
