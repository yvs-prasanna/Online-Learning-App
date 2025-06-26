const express = require('express');
const router = express.Router();
const {getSubscriptionPlans,
  purchaseSubscription,
  getMySubscription,
  getSubscriptionHistory,
  cancelSubscription,
  renewSubscription} = require('../controllers/subscriptionController');
const {authorizeUser} = require('../middlewares/authorizeUser')


router.get('/plans',authorizeUser, getSubscriptionPlans);
router.post('/purchase', authorizeUser, purchaseSubscription);
router.get('/my-subscription', authorizeUser, getMySubscription);
router.get('/history', authorizeUser, getSubscriptionHistory);
router.post('/cancel', authorizeUser, cancelSubscription);
router.post('/renew', authorizeUser, renewSubscription);

module.exports = router;