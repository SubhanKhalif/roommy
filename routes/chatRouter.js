import express from 'express';
import { 
    acessChat,
    fetchChats,
    createGroupChat,
    renameGroup,
    AddPersonGroup,
    RemovePersonGroup,
    DeleteChat
} from '../controllers/chatController.js';
import { protect } from '../controllers/authController.js';

const router = express.Router();

router.post('/', protect, acessChat);
router.get('/', protect, fetchChats);
router.post('/group', protect, createGroupChat);
router.put('/rename', protect, renameGroup);
router.put('/groupadd', protect, AddPersonGroup);
router.put('/groupremove', protect, RemovePersonGroup);
router.delete('/deleteChat', protect, DeleteChat);

export default router;