import express from 'express';
const router = express.Router();
import { protect } from '../controllers/authController.js';
import { sendMessage, getAllMessages } from '../controllers/messageController.js';

router.route('/')
    .post(protect, sendMessage);

router.route('/:chatId')
    .get(protect, getAllMessages);

export default router;