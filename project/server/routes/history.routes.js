import express from 'express';
import { 
  getHistory, 
  searchHistory, 
  deleteAllHistory 
} from '../controllers/history.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Protected routes
router.get('/', protect, getHistory);
router.get('/search', protect, searchHistory);
router.delete('/', protect, deleteAllHistory);

export default router;