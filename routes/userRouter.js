import express from 'express';
import { 
    protect,
    signup,
    login,
    isUserPresent,
    send
} from '../controllers/authController.js';
import { 
    getAllUsers,
    UpdateMe,
    uploadUserPhoto,
    UploadPhoto,
    getUserProfile,
    getUserById
} from '../controllers/userController.js';

const router = express.Router();

// User routes
router.get('/', protect, getAllUsers);
router.get('/me', protect, getUserProfile);
router.get('/:id', protect, getUserById);
router.patch('/updateMe', protect, UpdateMe);
router.patch('/uploadPhoto', protect, uploadUserPhoto, UploadPhoto);

// Authentication routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/ispresent', isUserPresent);
router.post('/protect', protect, send);

export default router;