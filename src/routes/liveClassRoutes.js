const express = require('express');
const {getLiveClassSchedule, joinLiveClass, doubtsForLiveClass } = require('../controllers/classController');
const {authorizeUser} = require('../middlewares/authorizeUser');


const router = express.Router();

router.get('/schedule', authorizeUser,getLiveClassSchedule);
router.post('/:liveClassId/join', authorizeUser, joinLiveClass);
router.get('/:lessonId/questions', authorizeUser, doubtsForLiveClass);

module.exports = router;