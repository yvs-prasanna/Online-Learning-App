const database = require('../config/database');

const getDashboard = async (req, res) => {
  try {
    const userId = req.userId;

    // Get user basic info
    const user = await database.get(`
      SELECT name, created_at
      FROM users WHERE id = ?
    `, [userId]);

    // Get enrollment statistics
    const enrollmentStats = await database.get(`
      SELECT 
        COUNT(*) as total_enrolled,
        COUNT(CASE WHEN progress_percentage >= 100 THEN 1 END) as completed_courses,
        AVG(progress_percentage) as avg_progress
      FROM enrollments 
      WHERE user_id = ? AND is_active = 1
    `, [userId]);

    // Get total watch time (in minutes)
    const watchTimeStats = await database.get(`
      SELECT 
        SUM(watched_duration) as total_seconds,
        COUNT(CASE WHEN completed = 1 THEN 1 END) as completed_lessons,
        COUNT(*) as total_lessons_watched
      FROM watch_history 
      WHERE user_id = ?
    `, [userId]);

    const totalWatchTimeMinutes = watchTimeStats.total_seconds ? 
      Math.round(watchTimeStats.total_seconds / 60) : 0;

    // Get upcoming live classes
    const upcomingClasses = await database.query(`
      SELECT 
        lc.id,
        lc.title,
        lc.scheduled_at,
        lc.duration_minutes,
        c.title as course_title,
        e.name as educator_name
      FROM live_classes lc
      JOIN courses c ON lc.course_id = c.id
      JOIN educators e ON lc.educator_id = e.id
      JOIN enrollments en ON c.id = en.course_id
      WHERE en.user_id = ? 
      AND en.is_active = 1
      AND lc.scheduled_at > datetime('now')
      AND lc.status = 'scheduled'
      ORDER BY lc.scheduled_at ASC
      LIMIT 5
    `, [userId]);

    // Get pending tests
    const pendingTests = await database.query(`
      SELECT 
        t.id,
        t.title,
        t.type,
        t.total_questions,
        t.duration_minutes,
        c.title as course_title
      FROM tests t
      LEFT JOIN courses c ON t.course_id = c.id
      LEFT JOIN enrollments e ON c.id = e.course_id AND e.user_id = ?
      WHERE (t.course_id IS NULL OR e.is_active = 1)
      AND t.is_active = 1
      AND t.id NOT IN (
        SELECT test_id FROM test_attempts 
        WHERE user_id = ? AND status = 'submitted'
      )
      ORDER BY t.created_at DESC
      LIMIT 5
    `, [userId, userId]);

    // Get weekly progress (last 7 days)
    const weeklyProgress = await database.query(`
      SELECT 
        DATE(last_watched_at) as date,
        SUM(watched_duration) as watch_time,
        COUNT(CASE WHEN completed = 1 THEN 1 END) as lessons_completed
      FROM watch_history 
      WHERE user_id = ? 
      AND last_watched_at > datetime('now', '-7 days')
      GROUP BY DATE(last_watched_at)
      ORDER BY date ASC
    `, [userId]);

    // Fill in missing days with zero values
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayData = weeklyProgress.find(d => d.date === dateStr);
      last7Days.push({
        date: dateStr,
        watchTime: dayData ? Math.round(dayData.watch_time / 60) : 0, // Convert to minutes
        lessonsCompleted: dayData ? dayData.lessons_completed : 0
      });
    }

    // Get recent achievements
    const recentAchievements = await database.query(`
      SELECT 
        achievement_type,
        achievement_data,
        earned_at
      FROM user_achievements 
      WHERE user_id = ?
      ORDER BY earned_at DESC
      LIMIT 5
    `, [userId]);

    // Get current streak information
    const streakInfo = await database.get(`
      SELECT 
        last_watched_at,
        (SELECT COUNT(*) FROM watch_history 
         WHERE user_id = ? AND DATE(last_watched_at) = DATE('now')) as today_activity from watch_history
    `, [userId]);

    const dashboardData = {
      user: {
        name: user.name,
        memberSince: user.created_at,
      },
      overview: {
        streakDays: streakInfo.todayActivity || 0,
        totalWatchTime: totalWatchTimeMinutes,
        coursesEnrolled: enrollmentStats.total_enrolled || 0,
        coursesCompleted: enrollmentStats.completed_courses || 0,
        avgProgress: enrollmentStats.avg_progress ? 
          Math.round(enrollmentStats.avg_progress) : 0,
        lessonsCompleted: watchTimeStats.completed_lessons || 0,
        todayActivity: streakInfo.today_activity || 0
      },
      upcomingClasses: upcomingClasses.map(liveClass => ({
        id: liveClass.id,
        title: liveClass.title,
        scheduledAt: liveClass.scheduled_at,
        duration: liveClass.duration_minutes,
        course: liveClass.course_title,
        educator: liveClass.educator_name
      })),
      pendingTests: pendingTests.map(test => ({
        id: test.id,
        title: test.title,
        type: test.type,
        questions: test.total_questions,
        duration: test.duration_minutes,
        course: test.course_title
      })),
      weeklyProgress: {
        dates: last7Days.map(d => d.date),
        watchTime: last7Days.map(d => d.watchTime),
        lessonsCompleted: last7Days.map(d => d.lessonsCompleted)
      },
      recentAchievements: recentAchievements.map(achievement => ({
        type: achievement.achievement_type,
        data: achievement.achievement_data ? 
          JSON.parse(achievement.achievement_data) : {},
        earnedAt: achievement.earned_at
      }))
    };

    res.json({
      success: true,
      dashboard: dashboardData
    });

  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data'
    });
  }
};

const getCourseProgress = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const userId = req.userId;

    // Check if user is enrolled
    const enrollment = await database.get(`
      SELECT * FROM enrollments 
      WHERE user_id = ? AND course_id = ? AND is_active = 1
    `, [userId, courseId]);

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: 'You are not enrolled in this course'
      });
    }

    // Get course details
    const course = await database.get(`
      SELECT 
        c.*,
        e.name as educator_name
      FROM courses c
      JOIN educators e ON c.educator_id = e.id
      WHERE c.id = ?
    `, [courseId]);

    // Get chapter-wise progress
    const chapters = await database.query(`
      SELECT 
        ch.id,
        ch.title,
        ch.description,
        ch.order_index,
        COUNT(l.id) as total_lessons,
        COUNT(CASE WHEN wh.completed = 1 THEN 1 END) as completed_lessons,
        SUM(l.duration_seconds) as total_duration,
        SUM(CASE WHEN wh.completed = 1 THEN l.duration_seconds ELSE 0 END) as completed_duration
      FROM course_chapters ch
      LEFT JOIN lessons l ON ch.id = l.chapter_id
      LEFT JOIN watch_history wh ON l.id = wh.lesson_id AND wh.user_id = ?
      WHERE ch.course_id = ?
      GROUP BY ch.id, ch.title, ch.description, ch.order_index
      ORDER BY ch.order_index
    `, [userId, courseId]);

    // Get test attempts for this course
    const testAttempts = await database.query(`
      SELECT 
        ta.id,
        ta.total_score,
        ta.max_score,
        ta.percentage,
        ta.submitted_at,
        t.title,
        t.type
      FROM test_attempts ta
      JOIN tests t ON ta.test_id = t.id
      WHERE ta.user_id = ? AND t.course_id = ? AND ta.status = 'submitted'
      ORDER BY ta.submitted_at DESC
    `, [userId, courseId]);

    // Calculate overall statistics
    const totalLessons = chapters.reduce((sum, ch) => sum + ch.total_lessons, 0);
    const completedLessons = chapters.reduce((sum, ch) => sum + ch.completed_lessons, 0);
    const totalDuration = chapters.reduce((sum, ch) => sum + (ch.total_duration || 0), 0);
    const completedDuration = chapters.reduce((sum, ch) => sum + (ch.completed_duration || 0), 0);

    const overallProgress = totalLessons > 0 ? 
      Math.round((completedLessons / totalLessons) * 100) : 0;

    // Get recent activity
    const recentActivity = await database.query(`
      SELECT 
        l.id,
        l.title,
        wh.last_watched_at,
        wh.watched_duration,
        wh.completed,
        ch.title as chapter_title
      FROM watch_history wh
      JOIN lessons l ON wh.lesson_id = l.id
      LEFT JOIN course_chapters ch ON l.chapter_id = ch.id
      WHERE wh.user_id = ? AND l.course_id = ?
      ORDER BY wh.last_watched_at DESC
      LIMIT 10
    `, [userId, courseId]);

    // Check certificate eligibility
    const certificateEligible = overallProgress >= 80 && testAttempts.length > 0;

    const progressData = {
      course: {
        id: course.id,
        title: course.title,
        educator: course.educator_name,
        thumbnail: course.thumbnail
      },
      enrollment: {
        enrolledOn: enrollment.enrolled_at,
        expiresOn: enrollment.expires_at,
        lastAccessed: enrollment.last_accessed
      },
      progress: {
        overall: overallProgress,
        completedLessons,
        totalLessons,
        completedDuration: Math.round(completedDuration / 60), // Convert to minutes
        totalDuration: Math.round(totalDuration / 60),
        certificateEligible
      },
      chapters: chapters.map(chapter => ({
        id: chapter.id,
        title: chapter.title,
        description: chapter.description,
        progress: chapter.total_lessons > 0 ? 
          Math.round((chapter.completed_lessons / chapter.total_lessons) * 100) : 0,
        completedLessons: chapter.completed_lessons,
        totalLessons: chapter.total_lessons,
        duration: Math.round((chapter.total_duration || 0) / 60)
      })),
      testAttempts: testAttempts.map(attempt => ({
        id: attempt.id,
        title: attempt.title,
        type: attempt.type,
        score: attempt.total_score,
        maxScore: attempt.max_score,
        percentage: attempt.percentage,
        submittedAt: attempt.submitted_at
      })),
      recentActivity: recentActivity.map(activity => ({
        lesson: {
          id: activity.id,
          title: activity.title,
          chapter: activity.chapter_title
        },
        lastWatchedAt: activity.last_watched_at,
        watchedDuration: Math.round(activity.watched_duration / 60),
        completed: Boolean(activity.completed)
      }))
    };

    res.json({
      success: true,
      progress: progressData
    });

  } catch (error) {
    console.error('Get course progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch course progress'
    });
  }
};

const getOverallAnalytics = async (req, res) => {
  try {
    const userId = req.userId;

    // Get learning analytics for the last 30 days
    const dailyActivity = await database.query(`
      SELECT 
        DATE(last_watched_at) as date,
        SUM(watched_duration) as total_watch_time,
        COUNT(DISTINCT lesson_id) as unique_lessons,
        COUNT(CASE WHEN completed = 1 THEN 1 END) as lessons_completed
      FROM watch_history 
      WHERE user_id = ? 
      AND last_watched_at > datetime('now', '-30 days')
      GROUP BY DATE(last_watched_at)
      ORDER BY date ASC
    `, [userId]);

    // Get subject-wise performance
    const subjectPerformance = await database.query(`
      SELECT 
        t.subject,
        COUNT(ta.id) as attempts,
        AVG(ta.percentage) as avg_percentage,
        MAX(ta.percentage) as best_percentage,
        AVG(ta.rank_position) as avg_rank
      FROM test_attempts ta
      JOIN tests t ON ta.test_id = t.id
      WHERE ta.user_id = ? AND ta.status = 'submitted'
      GROUP BY t.subject
      ORDER BY avg_percentage DESC
    `, [userId]);

    // Get monthly progress trend
    const monthlyTrend = await database.query(`
      SELECT 
        strftime('%Y-%m', last_watched_at) as month,
        SUM(watched_duration) as watch_time,
        COUNT(CASE WHEN completed = 1 THEN 1 END) as lessons_completed,
        COUNT(DISTINCT lesson_id) as unique_lessons
      FROM watch_history 
      WHERE user_id = ? 
      AND last_watched_at > datetime('now', '-6 months')
      GROUP BY strftime('%Y-%m', last_watched_at)
      ORDER BY month ASC
    `, [userId]);

    // Get test performance trend
    const testTrend = await database.query(`
      SELECT 
        strftime('%Y-%m', submitted_at) as month,
        COUNT(*) as tests_taken,
        AVG(percentage) as avg_score,
        AVG(rank_position) as avg_rank
      FROM test_attempts 
      WHERE user_id = ? 
      AND status = 'submitted'
      AND submitted_at > datetime('now', '-6 months')
      GROUP BY strftime('%Y-%m', submitted_at)
      ORDER BY month ASC
    `, [userId]);

    // Get learning streaks and patterns
    const learningPatterns = await database.query(`
      SELECT 
        strftime('%w', last_watched_at) as day_of_week,
        strftime('%H', last_watched_at) as hour_of_day,
        COUNT(*) as activity_count,
        SUM(watched_duration) as total_duration
      FROM watch_history 
      WHERE user_id = ? 
      AND last_watched_at > datetime('now', '-30 days')
      GROUP BY strftime('%w', last_watched_at), strftime('%H', last_watched_at)
      ORDER BY activity_count DESC
    `, [userId]);

    // Get course completion rates
    const courseCompletion = await database.query(`
      SELECT 
        c.id,
        c.title,
        c.target_exam,
        e.progress_percentage,
        e.enrolled_at,
        COUNT(l.id) as total_lessons,
        COUNT(CASE WHEN wh.completed = 1 THEN 1 END) as completed_lessons
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      LEFT JOIN lessons l ON c.id = l.course_id
      LEFT JOIN watch_history wh ON l.id = wh.lesson_id AND wh.user_id = ?
      WHERE e.user_id = ? AND e.is_active = 1
      GROUP BY c.id, c.title, c.target_exam, e.progress_percentage, e.enrolled_at
      ORDER BY e.progress_percentage DESC
    `, [userId, userId]);

    const analyticsData = {
      dailyActivity: dailyActivity.map(day => ({
        date: day.date,
        watchTime: Math.round((day.total_watch_time || 0) / 60), // Convert to minutes
        uniqueLessons: day.unique_lessons || 0,
        lessonsCompleted: day.lessons_completed || 0
      })),
      subjectPerformance: subjectPerformance.map(subject => ({
        subject: subject.subject,
        attempts: subject.attempts,
        avgPercentage: Math.round(subject.avg_percentage * 10) / 10,
        bestPercentage: Math.round(subject.best_percentage * 10) / 10,
        avgRank: Math.round(subject.avg_rank)
      })),
      monthlyTrend: monthlyTrend.map(month => ({
        month: month.month,
        watchTime: Math.round((month.watch_time || 0) / 60),
        lessonsCompleted: month.lessons_completed || 0,
        uniqueLessons: month.unique_lessons || 0
      })),
      testTrend: testTrend.map(month => ({
        month: month.month,
        testsTaken: month.tests_taken,
        avgScore: Math.round(month.avg_score * 10) / 10,
        avgRank: Math.round(month.avg_rank)
      })),
      learningPatterns: {
        mostActiveDay: learningPatterns.length > 0 ? 
          ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][learningPatterns[0].day_of_week] : null,
        mostActiveHour: learningPatterns.length > 0 ? 
          `${learningPatterns[0].hour_of_day}:00` : null,
        weeklyDistribution: Array.from({length: 7}, (_, i) => {
          const dayData = learningPatterns.filter(p => p.day_of_week == i);
          return dayData.reduce((sum, d) => sum + d.activity_count, 0);
        })
      },
      courseCompletion: courseCompletion.map(course => ({
        id: course.id,
        title: course.title,
        targetExam: course.target_exam,
        progress: course.progress_percentage,
        enrolledAt: course.enrolled_at,
        completionRate: course.total_lessons > 0 ? 
          Math.round((course.completed_lessons / course.total_lessons) * 100) : 0
      }))
    };

    res.json({
      success: true,
      analytics: analyticsData
    });

  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics data'
    });
  }
};

module.exports = {
  getDashboard,
  getCourseProgress,
  getOverallAnalytics
};