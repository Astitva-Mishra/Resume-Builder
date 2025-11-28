import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import{ createResume, getUserResumes,  updateResume, deleteResume, getResumeById } from '../controllers/resumeController.js';
import { uploadResumeImages } from '../controllers/uploadImages.js';
import { evaluateATS } from '../controllers/atsController.js';


const resumeRouter = express.Router();


resumeRouter.post('/', protect, createResume);
resumeRouter.get('/', protect, getUserResumes);
resumeRouter.get('/:id', protect, getResumeById);

resumeRouter.put('/:id', protect, updateResume);
resumeRouter.put('/:id/upload-images', protect, uploadResumeImages);
resumeRouter.post('/:id/evaluate-ats', protect, evaluateATS);


resumeRouter.delete('/:id', protect, deleteResume);

export default resumeRouter;