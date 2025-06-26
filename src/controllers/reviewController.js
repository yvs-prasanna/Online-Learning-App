const database = require('../config/database');
const { paginate } = require('../utils/helpers');
const getCourseReviews = async (req, res) => {
  try {
    const courseId = req.params.id;
    const { sort = 'newest' } = req.query;
    const pagination = paginate(req.query);

    // Check if course exists
    const course = await database.get(`
      SELECT id, title FROM courses WHERE id = ? AND is_active = 1
    `, [courseId]);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Determine sorting
    let orderBy = 'cr.created_at DESC';
    switch (sort) {
      case 'oldest':
        orderBy = 'cr.created_at ASC';
        break;
      case 'highest':
        orderBy = 'cr.rating DESC, cr.created_at DESC';
        break;
      case 'lowest':
        orderBy = 'cr.rating ASC, cr.created_at DESC';
        break;
      case 'helpful':
        orderBy = 'cr.helpful_count DESC, cr.created_at DESC';
        break;
      default:
        orderBy = 'cr.created_at DESC';
    }

    const reviewsQuery = `
      SELECT 
        cr.*,
        u.name as user_name,
        u.profile_image as user_image
      FROM course_reviews cr
      JOIN users u ON cr.user_id = u.id
      WHERE cr.course_id = ?
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM course_reviews 
      WHERE course_id = ?
    `;

    const [reviewsResult, countResult] = await Promise.all([
      database.query(reviewsQuery, [courseId, pagination.limit, pagination.offset]),
      database.query(countQuery, [courseId])
    ]);

    // Get rating distribution
    const ratingDistribution = await database.query(`
      SELECT 
        rating,
        COUNT(*) as count
      FROM course_reviews 
      WHERE course_id = ?
      GROUP BY rating
      ORDER BY rating DESC
    `, [courseId]);

    const reviews = reviewsResult.map(review => ({
      id: review.id,
      rating: review.rating,
      review: review.review,
      isVerifiedPurchase: Boolean(review.is_verified_purchase),
      helpfulCount: review.helpful_count,
      createdAt: review.created_at,
      updatedAt: review.updated_at,
      user: {
        name: review.user_name,
        image: review.user_image
      }
    }));

    const totalPages = Math.ceil(countResult[0].total / pagination.limit);

    // Calculate rating summary
    const ratingSummary = {
      1: 0, 2: 0, 3: 0, 4: 0, 5: 0
    };
    
    ratingDistribution.forEach(dist => {
      ratingSummary[dist.rating] = dist.count;
    });

    const totalReviews = countResult[0].total;
    const avgRating = totalReviews > 0 ? 
      ratingDistribution.reduce((sum, dist) => sum + (dist.rating * dist.count), 0) / totalReviews : 0;

    res.json({
      success: true,
      course: {
        id: course.id,
        title: course.title
      },
      summary: {
        totalReviews,
        averageRating: Math.round(avgRating * 10) / 10,
        ratingDistribution: ratingSummary
      },
      reviews,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: totalReviews,
        totalPages,
        hasNext: pagination.page < totalPages,
        hasPrev: pagination.page > 1
      }
    });

  } catch (error) {
    console.error('Get course reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews'
    });
  }
};

const updateReview = async (req, res) => {
  try {
    const reviewId = req.params.reviewId;
    const userId = req.userId;
    const { rating, review } = req.body;

    // Check if review exists and belongs to user
    const existingReview = await database.get(`
      SELECT id, course_id FROM course_reviews 
      WHERE id = ? AND user_id = ?
    `, [reviewId, userId]);

    if (!existingReview) {
      return res.status(404).json({
        success: false,
        message: 'Review not found or you do not have permission to update it'
      });
    }

    // Update review
    await database.run(`
      UPDATE course_reviews 
      SET rating = ?, review = ?, updated_at = datetime('now')
      WHERE id = ?
    `, [rating, review, reviewId]);

    // Update course rating statistics
    const ratingStats = await database.get(`
      SELECT 
        AVG(rating) as avg_rating,
        COUNT(*) as total_ratings
      FROM course_reviews 
      WHERE course_id = ?
    `, [existingReview.course_id]);

    await database.run(`
      UPDATE courses 
      SET rating = ?, total_ratings = ?
      WHERE id = ?
    `, [
      Math.round(ratingStats.avg_rating * 10) / 10,
      ratingStats.total_ratings,
      existingReview.course_id
    ]);

    res.json({
      success: true,
      message: 'Review updated successfully'
    });

  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update review'
    });
  }
};

const deleteReview = async (req, res) => {
  try {
    const reviewId = req.params.reviewId;
    const userId = req.userId;

    // Check if review exists and belongs to user
    const existingReview = await database.get(`
      SELECT id, course_id FROM course_reviews 
      WHERE id = ? AND user_id = ?
    `, [reviewId, userId]);

    if (!existingReview) {
      return res.status(404).json({
        success: false,
        message: 'Review not found or you do not have permission to delete it'
      });
    }

    // Delete review
    await database.run(`
      DELETE FROM course_reviews WHERE id = ?
    `, [reviewId]);

    // Update course rating statistics
    const ratingStats = await database.get(`
      SELECT 
        AVG(rating) as avg_rating,
        COUNT(*) as total_ratings
      FROM course_reviews 
      WHERE course_id = ?
    `, [existingReview.course_id]);

    const newRating = ratingStats.total_ratings > 0 ? 
      Math.round(ratingStats.avg_rating * 10) / 10 : 0;

    await database.run(`
      UPDATE courses 
      SET rating = ?, total_ratings = ?
      WHERE id = ?
    `, [newRating, ratingStats.total_ratings || 0, existingReview.course_id]);

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });

  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete review'
    });
  }
};

const markReviewHelpful = async (req, res) => {
  try {
    const reviewId = req.params.reviewId;

    // Check if review exists
    const review = await database.get(`
      SELECT id FROM course_reviews WHERE id = ?
    `, [reviewId]);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Increment helpful count
    await database.run(`
      UPDATE course_reviews 
      SET helpful_count = helpful_count + 1 
      WHERE id = ?
    `, [reviewId]);

    // Get updated count
    const updatedReview = await database.get(`
      SELECT helpful_count FROM course_reviews WHERE id = ?
    `, [reviewId]);

    res.json({
      success: true,
      message: 'Review marked as helpful',
      helpfulCount: updatedReview.helpful_count
    });

  } catch (error) {
    console.error('Mark review helpful error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark review as helpful'
    });
  }
};

const getMyReviews = async (req, res) => {
  try {
    const userId = req.userId;
    const pagination = paginate(req.query);

    const reviewsQuery = `
      SELECT 
        cr.*,
        c.title as course_title,
        c.thumbnail as course_thumbnail,
        e.name as educator_name
      FROM course_reviews cr
      JOIN courses c ON cr.course_id = c.id
      JOIN educators e ON c.educator_id = e.id
      WHERE cr.user_id = ?
      ORDER BY cr.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM course_reviews 
      WHERE user_id = ?
    `;

    const [reviewsResult, countResult] = await Promise.all([
      database.query(reviewsQuery, [userId, pagination.limit, pagination.offset]),
      database.query(countQuery, [userId])
    ]);

    const reviews = reviewsResult.map(review => ({
      id: review.id,
      rating: review.rating,
      review: review.review,
      helpfulCount: review.helpful_count,
      createdAt: review.created_at,
      updatedAt: review.updated_at,
      course: {
        id: review.course_id,
        title: review.course_title,
        thumbnail: review.course_thumbnail,
        educator: review.educator_name
      }
    }));

    const totalPages = Math.ceil(countResult[0].total / pagination.limit);

    res.json({
      success: true,
      reviews,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: countResult[0].total,
        totalPages,
        hasNext: pagination.page < totalPages,
        hasPrev: pagination.page > 1
      }
    });

  } catch (error) {
    console.error('Get my reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your reviews'
    });
  }
};

module.exports = {
  getCourseReviews,
  updateReview,
  deleteReview,
  markReviewHelpful,
  getMyReviews
};