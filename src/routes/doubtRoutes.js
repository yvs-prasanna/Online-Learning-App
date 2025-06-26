const express = require('express');
const router = express.Router();
const { postDoubt,
  getMyDoubts,
  getDoubtById,
  answerDoubt,
  acceptAnswer,
  voteAnswer,
  getDoubtsForEducator } = require('../controllers/doubtController');
const {authorizeUser} = require('../middlewares/authorizeUser')

router.post('/doubt', authorizeUser, postDoubt);
router.get('/my-doubts', authorizeUser, getMyDoubts);
router.get('/doubt/:id', authorizeUser, getDoubtById);
router.post('/doubt/:id/answer', authorizeUser, answerDoubt);
router.post('/doubt/:id/accept', authorizeUser, acceptAnswer);
router.post('/doubt/:id/vote', authorizeUser, voteAnswer);
router.get('/educator/doubts', authorizeUser, getDoubtsForEducator);

module.exports = router;