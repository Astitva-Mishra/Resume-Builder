import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import{ createResume, getUserResumes, getUserResumeById, updateResume } from '../controllers/resumeController.js';
import { uploadResumeImages } from '../controllers/uploadController.js';


const resumeRouter = express.Router();


resumeRouter.post('/', protect, createResume);
resumeRouter.get('/', protect, getUserResumes);
resumeRouter.get('/:id', protect, getUserResumeById);

resumeRouter.put('/:id', protect, updateResume);
resumeRouter.put('/:id/upload-images', protect, uploadResumeImages);


resumeRouter.delete('/:id', protect, deleteResume);

export default resumeRouter;