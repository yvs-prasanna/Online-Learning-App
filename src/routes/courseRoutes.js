const express = require('express');
const router = express.Router();
const {getCoursesAPI, getCourseByID, addCourseReview, enrollInCourse} = require('../controllers/courseController');
const {authorizeUser} = require('../middlewares/authorizeUser')

router.get('/courses', authorizeUser, getCoursesAPI);
router.get('/courses/:id', authorizeUser, getCourseByID);
router.post('/courses/:id/review', authorizeUser, addCourseReview);
router.post('/courses/:id/enroll', authorizeUser, enrollInCourse);

module.exports = router;