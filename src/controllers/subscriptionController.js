const database = require('../config/database');
const { paginate } = require('../utils/helpers');

const getSubscriptionPlans = async (req, res) => {
  try {
    const plans = await database.query(`
      SELECT 
        id,
        name,
        description,
        price,
        duration_days,
        features,
        max_courses,
        priority_support,
        offline_download,
        is_active
      FROM subscription_plans 
      WHERE is_active = 1
      ORDER BY price ASC
    `);

    const plansData = plans.map(plan => ({
      id: plan.id,
      name: plan.name,
      description: plan.description,
      price: plan.price,
      duration: plan.duration_days,
      features: plan.features ? JSON.parse(plan.features) : [],
      maxCourses: plan.max_courses,
      prioritySupport: Boolean(plan.priority_support),
      offlineDownload: Boolean(plan.offline_download),
      popular: plan.name === 'Plus' // Mark Plus as popular
    }));

    res.json({
      success: true,
      plans: plansData
    });

  } catch (error) {
    console.error('Get subscription plans error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscription plans'
    });
  }
};

const purchaseSubscription = async (req, res) => {
  try {
    const userId = req.userId;
    const { planId, paymentMethod, paymentId } = req.body;

    // Get plan details
    const plan = await database.get(`
      SELECT * FROM subscription_plans 
      WHERE id = ? AND is_active = 1
    `, [planId]);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Subscription plan not found'
      });
    }

    // Check if user already has an active subscription
    const activeSubscription = await database.get(`
      SELECT id, expires_at FROM user_subscriptions 
      WHERE user_id = ? AND is_active = 1 AND expires_at > datetime('now')
    `, [userId]);

    if (activeSubscription) {
      return res.status(409).json({
        success: false,
        message: 'You already have an active subscription',
        currentSubscription: {
          id: activeSubscription.id,
          expiresAt: activeSubscription.expires_at
        }
      });
    }

    // Calculate subscription dates
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + plan.duration_days);

    // Create subscription record
    const result = await database.run(`
      INSERT INTO user_subscriptions 
      (user_id, plan_id, started_at, expires_at, payment_amount, payment_method, payment_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      userId,
      planId,
      startDate.toISOString(),
      endDate.toISOString(),
      plan.price,
      paymentMethod,
      paymentId
    ]);

    // Deactivate any previous subscriptions
    await database.run(`
      UPDATE user_subscriptions 
      SET is_active = 0 
      WHERE user_id = ? AND id != ?
    `, [userId, result.lastID]);

    res.status(201).json({
      success: true,
      message: 'Subscription purchased successfully',
      subscription: {
        id: result.lastID,
        planName: plan.name,
        startedAt: startDate.toISOString(),
        expiresAt: endDate.toISOString(),
        amount: plan.price,
        features: plan.features ? JSON.parse(plan.features) : []
      }
    });

  } catch (error) {
    console.error('Purchase subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to purchase subscription'
    });
  }
};

const getMySubscription = async (req, res) => {
  try {
    const userId = req.userId;

    // Get current active subscription
    const subscription = await database.get(`
      SELECT 
        us.*,
        sp.name,
        sp.description,
        sp.features,
        sp.max_courses,
        sp.priority_support,
        sp.offline_download
      FROM user_subscriptions us
      JOIN subscription_plans sp ON us.plan_id = sp.id
      WHERE us.user_id = ? AND us.is_active = 1
      ORDER BY us.started_at DESC
      LIMIT 1
    `, [userId]);

    if (!subscription) {
      return res.json({
        success: true,
        subscription: null,
        message: 'No active subscription found'
      });
    }

    // Check if subscription is expired
    const now = new Date();
    const expiryDate = new Date(subscription.expires_at);
    const isExpired = now > expiryDate;

    // Calculate days remaining
    const daysRemaining = isExpired ? 0 : 
      Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));

    // Get subscription usage statistics
    const usageStats = await database.get(`
      SELECT 
        COUNT(DISTINCT e.course_id) as courses_accessed,
        SUM(wh.watched_duration) as total_watch_time
      FROM enrollments e
      LEFT JOIN lessons l ON e.course_id = l.course_id
      LEFT JOIN watch_history wh ON l.id = wh.lesson_id AND wh.user_id = ?
      WHERE e.user_id = ? AND e.enrolled_at >= ?
    `, [userId, userId, subscription.started_at]);

    const subscriptionData = {
      id: subscription.id,
      plan: {
        id: subscription.plan_id,
        name: subscription.name,
        description: subscription.description,
        features: subscription.features ? JSON.parse(subscription.features) : [],
        maxCourses: subscription.max_courses,
        prioritySupport: Boolean(subscription.priority_support),
        offlineDownload: Boolean(subscription.offline_download)
      },
      startedAt: subscription.started_at,
      expiresAt: subscription.expires_at,
      daysRemaining,
      isExpired,
      autoRenewal: Boolean(subscription.auto_renewal),
      paymentAmount: subscription.payment_amount,
      paymentMethod: subscription.payment_method,
      usage: {
        coursesAccessed: usageStats.courses_accessed || 0,
        totalWatchTime: Math.round((usageStats.total_watch_time || 0) / 60) // Convert to minutes
      }
    };

    res.json({
      success: true,
      subscription: subscriptionData
    });

  } catch (error) {
    console.error('Get my subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscription details'
    });
  }
};

const getSubscriptionHistory = async (req, res) => {
  try {
    const userId = req.userId;
    const pagination = paginate(req.query);

    const subscriptions = await database.query(`
      SELECT 
        us.*,
        sp.name,
        sp.description,
        sp.price as plan_price
      FROM user_subscriptions us
      JOIN subscription_plans sp ON us.plan_id = sp.id
      WHERE us.user_id = ?
      ORDER BY us.started_at DESC
      LIMIT ? OFFSET ?
    `, [userId, pagination.limit, pagination.offset]);

    const totalCount = await database.get(`
      SELECT COUNT(*) as total 
      FROM user_subscriptions 
      WHERE user_id = ?
    `, [userId]);

    const subscriptionHistory = subscriptions.map(sub => {
      const now = new Date();
      const expiryDate = new Date(sub.expires_at);
      const isExpired = now > expiryDate;
      
      return {
        id: sub.id,
        planName: sub.name,
        planDescription: sub.description,
        startedAt: sub.started_at,
        expiresAt: sub.expires_at,
        isActive: Boolean(sub.is_active),
        isExpired,
        paymentAmount: sub.payment_amount,
        paymentMethod: sub.payment_method,
        paymentId: sub.payment_id,
        autoRenewal: Boolean(sub.auto_renewal)
      };
    });

    const totalPages = Math.ceil(totalCount.total / pagination.limit);

    res.json({
      success: true,
      subscriptions: subscriptionHistory,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: totalCount.total,
        totalPages,
        hasNext: pagination.page < totalPages,
        hasPrev: pagination.page > 1
      }
    });

  } catch (error) {
    console.error('Get subscription history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscription history'
    });
  }
};

const cancelSubscription = async (req, res) => {
  try {
    const userId = req.userId;
    const { reason } = req.body;

    // Get current active subscription
    const subscription = await database.get(`
      SELECT id, expires_at, auto_renewal 
      FROM user_subscriptions 
      WHERE user_id = ? AND is_active = 1 AND expires_at > datetime('now')
    `, [userId]);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'No active subscription found to cancel'
      });
    }

    // Turn off auto-renewal instead of immediate cancellation
    await database.run(`
      UPDATE user_subscriptions 
      SET auto_renewal = 0
      WHERE id = ?
    `, [subscription.id]);

    // Log cancellation reason if provided
    if (reason) {
      await database.run(`
        INSERT INTO user_analytics (user_id, event_type, event_data)
        VALUES (?, 'subscription_cancelled', ?)
      `, [userId, JSON.stringify({ reason, subscriptionId: subscription.id })]);
    }

    res.json({
      success: true,
      message: 'Auto-renewal has been turned off. Your subscription will remain active until the expiry date.',
      subscription: {
        id: subscription.id,
        expiresAt: subscription.expires_at,
        autoRenewal: false
      }
    });

  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel subscription'
    });
  }
};

const renewSubscription = async (req, res) => {
  try {
    const userId = req.userId;
    const { paymentMethod, paymentId } = req.body;

    // Get current subscription
    const currentSubscription = await database.get(`
      SELECT 
        us.*,
        sp.price,
        sp.duration_days,
        sp.name
      FROM user_subscriptions us
      JOIN subscription_plans sp ON us.plan_id = sp.id
      WHERE us.user_id = ? AND us.is_active = 1
      ORDER BY us.started_at DESC
      LIMIT 1
    `, [userId]);

    if (!currentSubscription) {
      return res.status(404).json({
        success: false,
        message: 'No subscription found to renew'
      });
    }

    // Calculate new dates
    const currentExpiry = new Date(currentSubscription.expires_at);
    const now = new Date();
    const startDate = currentExpiry > now ? currentExpiry : now;
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + currentSubscription.duration_days);

    // Create new subscription record
    const result = await database.run(`
      INSERT INTO user_subscriptions 
      (user_id, plan_id, started_at, expires_at, payment_amount, payment_method, payment_id, auto_renewal)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1)
    `, [
      userId,
      currentSubscription.plan_id,
      startDate.toISOString(),
      endDate.toISOString(),
      currentSubscription.price,
      paymentMethod,
      paymentId
    ]);

    // Deactivate previous subscription
    await database.run(`
      UPDATE user_subscriptions 
      SET is_active = 0 
      WHERE user_id = ? AND id != ?
    `, [userId, result.lastID]);

    res.json({
      success: true,
      message: 'Subscription renewed successfully',
      subscription: {
        id: result.lastID,
        planName: currentSubscription.name,
        startedAt: startDate.toISOString(),
        expiresAt: endDate.toISOString(),
        amount: currentSubscription.price,
        autoRenewal: true
      }
    });

  } catch (error) {
    console.error('Renew subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to renew subscription'
    });
  }
};

const toggleAutoRenewal = async (req, res) => {
  try {
    const userId = req.userId;
    const { autoRenewal } = req.body;

    // Get current active subscription
    const subscription = await database.get(`
      SELECT id FROM user_subscriptions 
      WHERE user_id = ? AND is_active = 1 AND expires_at > datetime('now')
    `, [userId]);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'No active subscription found'
      });
    }

    // Update auto-renewal setting
    await database.run(`
      UPDATE user_subscriptions 
      SET auto_renewal = ?
      WHERE id = ?
    `, [autoRenewal ? 1 : 0, subscription.id]);

    res.json({
      success: true,
      message: `Auto-renewal ${autoRenewal ? 'enabled' : 'disabled'} successfully`,
      autoRenewal: Boolean(autoRenewal)
    });

  } catch (error) {
    console.error('Toggle auto-renewal error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update auto-renewal setting'
    });
  }
};

module.exports = {
  getSubscriptionPlans,
  purchaseSubscription,
  getMySubscription,
  getSubscriptionHistory,
  cancelSubscription,
  renewSubscription,
  toggleAutoRenewal
};