import { Router } from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  getRelatedProducts,
  getTrendingProducts,
  getNewArrivals,
  uploadProductImage,
} from '../controllers/productController';
import { protect, adminOnly } from '../middlewares/auth';
import { upload } from '../middlewares/upload';

const router = Router();

// Specialized public product list queries
router.get('/trending', getTrendingProducts);
router.get('/new-arrivals', getNewArrivals);

router.route('/')
  .get(getProducts)
  .post(protect, adminOnly, createProduct);

router.post('/upload', protect, adminOnly, upload.single('image'), uploadProductImage);

router.route('/:id')
  .get(getProductById)
  .put(protect, adminOnly, updateProduct)
  .delete(protect, adminOnly, deleteProduct);

router.get('/:id/related', getRelatedProducts);
router.post('/:id/reviews', protect, createProductReview);

export default router;
