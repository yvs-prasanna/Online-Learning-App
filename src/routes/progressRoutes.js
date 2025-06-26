const express = require('express');
const router = express.Router();
const { getDashboard,
  getCourseProgress,
  getOverallAnalytics} = require('../controllers/progressController');
const {authorizeUser} = require('../middlewares/authorizeUser')


router.get('/dashboard', authorizeUser, getDashboard);
router.get('/course/:courseId', authorizeUser, getCourseProgress);
router.get('/overall-analytics', authorizeUser, getOverallAnalytics);

module.exports = router;