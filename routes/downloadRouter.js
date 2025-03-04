import express from 'express';
import { Router } from 'express';
import { downloadFile } from '../controllers/authController.js';

const router = Router();
router.route('/').get(downloadFile);

export default router;