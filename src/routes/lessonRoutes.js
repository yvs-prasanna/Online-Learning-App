const express = require('express');
const router = express.Router();
const {getLessonById,
  updateLessonProgress,
  saveLessonNote,
  getLessonNotes,
  updateLessonNote,
  deleteLessonNote} = require('../controllers/lessonController');
const {authorizeUser} = require('../middlewares/authorizeUser');

router.get('/lessons/:id', authorizeUser, getLessonById);
router.put('/lessons/:id/progress', authorizeUser, updateLessonProgress);
router.post('/lessons/:id/notes', authorizeUser, saveLessonNote);
router.get('/lessons/:id/notes', authorizeUser, getLessonNotes);
router.put('/lessons/:id/notes/:noteId', authorizeUser, updateLessonNote);
router.delete('/lessons/:id/notes/:noteId', authorizeUser, deleteLessonNote);

module.exports = router;