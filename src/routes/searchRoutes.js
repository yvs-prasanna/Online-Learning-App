const express = require('express');
const router = express.Router();
const { globalSearch,
  searchCourses,
  getSearchSuggestions,
  getPopularSearches} = require('../controllers/searchController');
const {authorizeUser} = require('../middlewares/authorizeUser')


router.get('/search', authorizeUser, globalSearch);
router.get('/search-courses', authorizeUser, searchCourses);
router.get('/search-suggestions', authorizeUser, getSearchSuggestions);
router.get('/popular-searches', authorizeUser, getPopularSearches);

module.exports = router;