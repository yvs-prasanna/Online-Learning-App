const express = require('express');
const router = express.Router();
const {getEducators,
  getEducatorById,
  followEducator,
  unfollowEducator,
  getFollowedEducators,
  getEducatorStats} = require("../controllers/educatorController");
const {authorizeUser} = require('../middlewares/authorizeUser');


router.get('/educators', authorizeUser, getEducators);
router.post('/educators/:id/follow', authorizeUser, followEducator);
router.delete('/educators/:id/unfollow', authorizeUser, unfollowEducator);
router.get('/educators/:id', authorizeUser, getEducatorById);
router.get('/educators/followed', authorizeUser, getFollowedEducators);
router.get('/educators/:id/stats', authorizeUser, getEducatorStats);

module.exports = router;