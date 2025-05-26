import express from 'express';
import { 
  getMetadata, 
  deleteMetadata, 
  getMetadataStats 
} from '../controllers/metadata.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Protected routes
router.get('/stats', protect, getMetadataStats);
router.get('/:id', protect, getMetadata);
router.delete('/:id', protect, deleteMetadata);

export default router;