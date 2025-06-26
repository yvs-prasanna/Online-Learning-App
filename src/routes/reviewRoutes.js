const express = require('express');
const router = express.Router();
const {
  getCourseReviews,
  updateReview,
  deleteReview,
  markReviewHelpful,
  getMyReviews} = require('../controllers/reviewController');
const {authorizeUser} = require('../middlewares/authorizeUser')

router.get('/get-course-reviews', authorizeUser, getCourseReviews);
router.put('/update-review', authorizeUser, updateReview);
router.delete('/delete-review', authorizeUser, deleteReview);
router.put('/mark-review-helpful', authorizeUser, markReviewHelpful);
router.get('/get-my-reviews', authorizeUser, getMyReviews);

module.exports = router;