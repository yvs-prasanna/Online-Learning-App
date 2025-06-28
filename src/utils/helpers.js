const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

const generateSecureUrl = (originalUrl, expiresIn = 3600) => {
  const expiry = Math.floor(Date.now() / 1000) + expiresIn;
  const data = `${originalUrl}:${expiry}`;
  const signature = crypto
    .createHmac('sha256', process.env.VIDEO_SECRET || 'default-secret')
    .update(data)
    .digest('hex');
  
  return `${originalUrl}?expires=${expiry}&signature=${signature}`;
};

const calculateProgress = (watchedLessons, totalLessons) => {
  if (totalLessons === 0) return 0;
  return Math.round((watchedLessons / totalLessons) * 100 * 100) / 100;
};

const formatDuration = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  } else {
    return `${remainingSeconds}s`;
  }
};

const parseFilters = (query) => {
  const filters = {};
  const conditions = [];
  const params = [];

  if (query.exam) {
    conditions.push('target_exam = ?');
    params.push(query.exam);
  }

  if (query.subject) {
    conditions.push('subjects LIKE ?');
    params.push(`%"${query.subject}"%`);
  }

  if (query.language) {
    conditions.push('language = ?');
    params.push(query.language);
  }

  if (query.type) {
    conditions.push('course_type = ?');
    params.push(query.type);
  }

  if (query.educator) {
    conditions.push('educator_id = ?');
    params.push(parseInt(query.educator));
  }

  filters.conditions = conditions;
  filters.params = params;
  
  return filters;
};

const parseSorting = (sortBy) => {
  const sortOptions = {
    popular: 'enrolled_students DESC',
    price: 'COALESCE(discounted_price, price) ASC',
    rating: 'rating DESC',
    newest: 'created_at DESC'
  };

  return sortOptions[sortBy] || 'enrolled_students DESC';
};

const calculateRank = (score, totalAttempts) => {
  // Simplified rank calculation - in real scenario, this would be more complex
  const percentile = ((totalAttempts - Math.floor(totalAttempts * 0.3)) / totalAttempts) * 100;
  const rank = Math.floor(totalAttempts * (100 - percentile) / 100);
  
  return {
    rank: Math.max(1, rank),
    percentile: Math.round(percentile * 100) / 100
  };
};

const generateSessionId = () => {
  return `TEST_SESSION_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
};

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidMobile = (mobile) => {
  const mobileRegex = /^\+?[1-9]\d{1,14}$/;
  return mobileRegex.test(mobile);
};

const paginate = (query) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const offset = (page - 1) * limit;

  return {
    limit: Math.min(limit, 50), // Max 50 items per page
    offset: Math.max(offset, 0),
    page
  };
};

const formatCurrency = (amount, currency = 'INR') => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

module.exports = {
  generateToken,
  generateSecureUrl,
  calculateProgress,
  formatDuration,
  parseFilters,
  parseSorting,
  calculateRank,
  generateSessionId,
  isValidEmail,
  isValidMobile,
  paginate,
  formatCurrency
};