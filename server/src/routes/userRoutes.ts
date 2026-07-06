import { Router } from 'express';
import { updateUserProfile, changePassword, deleteAccount, getUsers } from '../controllers/userController';
import { protect, adminOnly } from '../middlewares/auth';

const router = Router();

router.use(protect);

router.get('/', adminOnly, getUsers);
router.put('/profile', updateUserProfile);
router.put('/change-password', changePassword);
router.delete('/delete-account', deleteAccount);

export default router;
