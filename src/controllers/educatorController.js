const database = require('../config/database');
const { paginate } = require('../utils/helpers');

const getEducators = async (req, res) => {
  try {
    const { subject, exam, rating, verified } = req.query;
    const pagination = paginate(req.query);

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (subject) {
      whereClause += ' AND subject LIKE ?';
      params.push(`%"${subject}"%`);
    }

    if (exam) {
      whereClause += ` AND id IN (
        SELECT DISTINCT educator_id FROM courses WHERE target_exam = ?
      )`;
      params.push(exam);
    }

    if (rating) {
      whereClause += ' AND rating >= ?';
      params.push(parseFloat(rating));
    }

    if (verified === 'true') {
      whereClause += ' AND is_verified = 1';
    }

    const educatorsQuery = `
      SELECT 
        id,
        name,
        subject,
        qualification,
        experience,
        bio,
        rating,
        is_verified,
        created_at
      FROM educators inner join educator_subjects on educators.id = educator_subjects.educator_id
      ${whereClause}
      ORDER BY rating DESC
      LIMIT ? OFFSET ?
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM educators
      ${whereClause}
    `;

    const [educatorsResult, countResult] = await Promise.all([
      database.query(educatorsQuery, [...params, pagination.limit, pagination.offset]),
      database.query(countQuery, params)
    ]);

    // Get course count for each educator
    const educators = await Promise.all(
      educatorsResult.map(async (educator) => {
        const courseCount = await database.get(`
          SELECT COUNT(*) as count 
          FROM courses 
          WHERE educator_id = ? 
        `, [educator.id]);

        const followerCount = await database.get(`
          SELECT COUNT(*) as count 
          FROM educator_followers 
          WHERE educator_id = ?
        `, [educator.id]);

        return {
          id: educator.id,
          name: educator.name,
          subjects: educator.subject,
          qualification: educator.qualification,
          experience: educator.experience,
          bio: educator.bio,
          rating: educator.rating,
          isVerified: Boolean(educator.is_verified),
          totalCourses: courseCount.count,
          followers: followerCount.count,
          createdAt: educator.created_at
        };
      })
    );

    const totalPages = Math.ceil(countResult[0].total / pagination.limit);

    res.json({
      success: true,
      educators,
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
    console.error('Get educators error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch educators'
    });
  }
};

const getEducatorById = async (req, res) => {
  try {
    const educatorId = req.params.id;

    // Get educator details
    const educator = await database.get(`
      SELECT * FROM educators WHERE id = ?
    `, [educatorId]);

    if (!educator) {
      return res.status(404).json({
        success: false,
        message: 'Educator not found'
      });
    }

    // Get educator's courses
    const courses = await database.query(`
      SELECT 
        id,
        title,
        description,
        target_exam,
        subject,
        language,
        duration,
        total_lessons,
        price,
        discounted_price,
        thumbnail,
        rating,
        enrolled_students,
        created_at
      FROM courses inner join educator_subjects on courses.educator_id = educator_subjects.educator_id
      WHERE courses.educator_id = ? 
      ORDER BY enrolled_students DESC
    `, [educatorId]);

    // Get recent reviews from courses
    const reviews = await database.query(`
      SELECT 
        cr.rating,
        cr.review,
        cr.created_at,
        cr.helpful_count,
        u.name as user_name,
        c.title as course_title
      FROM course_reviews cr
      JOIN users u ON cr.user_id = u.id
      JOIN courses c ON cr.course_id = c.id
      WHERE c.educator_id = ?
      ORDER BY cr.created_at DESC
      LIMIT 10
    `, [educatorId]);

    // Get follower count
    const followerCount = await database.get(`
      SELECT COUNT(*) as count 
      FROM educator_followers 
      WHERE educator_id = ?
    `, [educatorId]);

    // Get total live classes conducted
    const liveClassCount = await database.get(`
      SELECT COUNT(*) as count 
      FROM live_classes 
      WHERE educator_id = ? AND status = 'completed'
    `, [educatorId]);

    const educatorData = {
      id: educator.id,
      name: educator.name,
      email: educator.email,
      mobile: educator.mobile,
      subjects: educator.subject,
      qualification: educator.qualification,
      experience: educator.experience,
      bio: educator.bio,
      rating: educator.rating,
      isVerified: Boolean(educator.is_verified),
      followers: followerCount.count,
      totalCourses: courses.length,
      totalLiveClasses: liveClassCount.count,
      courses: courses.map(course => ({
        id: course.id,
        title: course.title,
        description: course.description,
        targetExam: course.target_exam,
        subjects: course.subjects ? JSON.parse(course.subjects) : [],
        language: course.language,
        level: course.level,
        duration: `${course.duration_months} months`,
        totalLessons: course.total_lessons,
        price: course.price,
        discountedPrice: course.discounted_price,
        thumbnail: course.thumbnail,
        rating: course.rating,
        totalRatings: course.total_ratings,
        enrolledStudents: course.enrolled_students,
        courseType: course.course_type,
        createdAt: course.created_at
      })),
      reviews: reviews.map(review => ({
        rating: review.rating,
        review: review.review,
        createdAt: review.created_at,
        helpfulCount: review.helpful_count,
        user: {
          name: review.user_name,
          image: review.user_image
        },
        course: review.course_title
      })),
      createdAt: educator.created_at,
      updatedAt: educator.updated_at
    };

    res.json({
      success: true,
      educator: educatorData
    });

  } catch (error) {
    console.error('Get educator by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch educator details'
    });
  }
};

const followEducator = async (req, res) => {
  try {
    const educatorId = req.params.id;
    const userId = req.userId;

    // Check if educator exists
    const educator = await database.get(`
      SELECT id, name FROM educators WHERE id = ?
    `, [educatorId]);

    if (!educator) {
      return res.status(404).json({
        success: false,
        message: 'Educator not found'
      });
    }

    // Check if already following
    const existingFollow = await database.get(`
      SELECT id FROM educator_followers 
      WHERE user_id = ? AND educator_id = ?
    `, [userId, educatorId]);

    if (existingFollow) {
      return res.status(409).json({
        success: false,
        message: 'You are already following this educator'
      });
    }

    // Create follow relationship
    await database.run(`
      INSERT INTO educator_followers (user_id, educator_id)
      VALUES (?, ?)
    `, [userId, educatorId]);

    res.status(201).json({
      success: true,
      message: `You are now following ${educator.name}`
    });

  } catch (error) {
    console.error('Follow educator error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to follow educator'
    });
  }
};

const unfollowEducator = async (req, res) => {
  try {
    const educatorId = req.params.id;
    const userId = req.userId;

    // Check if following
    const existingFollow = await database.get(`
      SELECT id FROM educator_followers 
      WHERE user_id = ? AND educator_id = ?
    `, [userId, educatorId]);

    if (!existingFollow) {
      return res.status(404).json({
        success: false,
        message: 'You are not following this educator'
      });
    }

    // Remove follow relationship
    await database.run(`
      DELETE FROM educator_followers 
      WHERE user_id = ? AND educator_id = ?
    `, [userId, educatorId]);

    res.json({
      success: true,
      message: 'Successfully unfollowed educator'
    });

  } catch (error) {
    console.error('Unfollow educator error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unfollow educator'
    });
  }
};

const getFollowedEducators = async (req, res) => {
  try {
    const userId = req.userId;
    const pagination = paginate(req.query);

    const followedEducators = await database.query(`
      SELECT 
        e.*,
        ef.followed_at,
        (SELECT COUNT(*) FROM courses WHERE educator_id = e.id AND is_active = 1) as total_courses
      FROM educator_followers ef
      JOIN educators e ON ef.educator_id = e.id
      WHERE ef.user_id = ?
      ORDER BY ef.followed_at DESC
      LIMIT ? OFFSET ?
    `, [userId, pagination.limit, pagination.offset]);

    const educators = followedEducators.map(educator => ({
      id: educator.id,
      name: educator.name,
      subjects: educator.subjects ? JSON.parse(educator.subjects) : [],
      qualification: educator.qualification,
      experience: educator.experience,
      profileImage: educator.profile_image,
      rating: educator.rating,
      totalRatings: educator.total_ratings,
      isVerified: Boolean(educator.is_verified),
      totalStudents: educator.total_students,
      totalCourses: educator.total_courses,
      followedAt: educator.followed_at
    }));

    res.json({
      success: true,
      educators,
      pagination: {
        page: pagination.page,
        limit: pagination.limit
      }
    });

  } catch (error) {
    console.error('Get followed educators error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch followed educators'
    });
  }
};

const getEducatorStats = async (req, res) => {
  try {
    const educatorId = req.params.id;
    const userId = req.userId;

    // Verify educator exists and user has permission
    const educator = await database.get(`
      SELECT id, name FROM educators WHERE id = ?
    `, [educatorId]);

    if (!educator) {
      return res.status(404).json({
        success: false,
        message: 'Educator not found'
      });
    }

    // Check if requesting user is the educator or has admin access
    if (req.user.role !== 'educator' || req.user.id !== parseInt(educatorId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own statistics.'
      });
    }

    // Get comprehensive statistics
    const stats = await Promise.all([
      // Total students across all courses
      database.get(`
        SELECT COUNT(DISTINCT e.user_id) as total_students
        FROM enrollments e
        JOIN courses c ON e.course_id = c.id
        WHERE c.educator_id = ? AND e.is_active = 1
      `, [educatorId]),

      // Total revenue (sum of all enrollments)
      database.get(`
        SELECT SUM(e.purchase_price) as total_revenue
        FROM enrollments e
        JOIN courses c ON e.course_id = c.id
        WHERE c.educator_id = ?
      `, [educatorId]),

      // Course statistics
      database.get(`
        SELECT 
          COUNT(*) as total_courses,
          AVG(rating) as avg_rating,
          SUM(enrolled_students) as total_enrollments
        FROM courses 
        WHERE educator_id = ? AND is_active = 1
      `, [educatorId]),

      // Live class statistics
      database.get(`
        SELECT 
          COUNT(*) as total_live_classes,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_classes,
          AVG(duration_minutes) as avg_duration
        FROM live_classes 
        WHERE educator_id = ?
      `, [educatorId]),

      // Recent enrollments (last 30 days)
      database.get(`
        SELECT COUNT(*) as recent_enrollments
        FROM enrollments e
        JOIN courses c ON e.course_id = c.id
        WHERE c.educator_id = ? 
        AND e.enrolled_at > datetime('now', '-30 days')
      `, [educatorId]),

      // Doubt resolution statistics
      database.get(`
        SELECT 
          COUNT(*) as total_doubts_answered,
          AVG(upvotes) as avg_upvotes
        FROM doubt_answers 
        WHERE educator_id = ?
      `, [educatorId])
    ]);

    const [
      studentStats,
      revenueStats,
      courseStats,
      liveClassStats,
      recentEnrollments,
      doubtStats
    ] = stats;

    // Get monthly enrollment trend (last 6 months)
    const monthlyTrend = await database.query(`
      SELECT 
        strftime('%Y-%m', e.enrolled_at) as month,
        COUNT(*) as enrollments,
        SUM(e.purchase_price) as revenue
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      WHERE c.educator_id = ? 
      AND e.enrolled_at > datetime('now', '-6 months')
      GROUP BY strftime('%Y-%m', e.enrolled_at)
      ORDER BY month DESC
    `, [educatorId]);

    // Get top performing courses
    const topCourses = await database.query(`
      SELECT 
        id,
        title,
        enrolled_students,
        rating,
        total_ratings,
        price,
        discounted_price
      FROM courses 
      WHERE educator_id = ? AND is_active = 1
      ORDER BY enrolled_students DESC
      LIMIT 5
    `, [educatorId]);

    const statisticsData = {
      overview: {
        totalStudents: studentStats.total_students || 0,
        totalRevenue: revenueStats.total_revenue || 0,
        totalCourses: courseStats.total_courses || 0,
        avgRating: courseStats.avg_rating ? Math.round(courseStats.avg_rating * 10) / 10 : 0,
        totalEnrollments: courseStats.total_enrollments || 0,
        recentEnrollments: recentEnrollments.recent_enrollments || 0
      },
      liveClasses: {
        total: liveClassStats.total_live_classes || 0,
        completed: liveClassStats.completed_classes || 0,
        avgDuration: liveClassStats.avg_duration ? Math.round(liveClassStats.avg_duration) : 0
      },
      doubts: {
        totalAnswered: doubtStats.total_doubts_answered || 0,
        avgUpvotes: doubtStats.avg_upvotes ? Math.round(doubtStats.avg_upvotes * 10) / 10 : 0
      },
      trends: {
        monthly: monthlyTrend.map(trend => ({
          month: trend.month,
          enrollments: trend.enrollments,
          revenue: trend.revenue
        }))
      },
      topCourses: topCourses.map(course => ({
        id: course.id,
        title: course.title,
        enrolledStudents: course.enrolled_students,
        rating: course.rating,
        totalRatings: course.total_ratings,
        price: course.price,
        discountedPrice: course.discounted_price
      }))
    };

    res.json({
      success: true,
      statistics: statisticsData
    });

  } catch (error) {
    console.error('Get educator stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch educator statistics'
    });
  }
};

module.exports = {
  getEducators,
  getEducatorById,
  followEducator,
  unfollowEducator,
  getFollowedEducators,
  getEducatorStats
};