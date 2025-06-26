const express = require('express');
const router = express.Router();
const {getTests,getTestById,
  startTest,
  submitTest,
  getTestResult,
  getMyTestAttempts} = require('../controllers/testsController');
const {authorizeUser} = require('../middlewares/authorizeUser')

router.get('/tests', authorizeUser, getTests);
router.get('/tests/:id', authorizeUser, getTestById);
router.post('/tests/:id/start', authorizeUser, startTest);
router.post('/tests/:sessionId/submit', authorizeUser, submitTest);
router.get('/tests/result', authorizeUser, getTestResult);
router.get('/tests/attempts', authorizeUser, getMyTestAttempts);

module.exports = router;