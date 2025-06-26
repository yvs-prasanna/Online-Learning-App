const database = require('../config/database');
const { paginate } = require('../utils/helpers');

const globalSearch = async (req, res) => {
  try {
    const { q: query, type } = req.query;
    const pagination = paginate(req.query);

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters long'
      });
    }

    const searchTerm = `%${query.trim()}%`;
    const results = {};

    // Search courses if no specific type or type is 'course'
    if (!type || type === 'course') {
      const coursesQuery = `
        SELECT 
          c.id,
          c.title,
          c.description,
          c.target_exam,
          subject,
          c.language,
          c.price,
          c.discounted_price,
          c.thumbnail,
          c.rating,
          c.enrolled_students,
          e.name as educator_name,
          e.rating as educator_rating,
          e.is_verified as educator_verified
        FROM (courses c
        JOIN educators e ON c.educator_id = e.id) as T inner join educator_subjects on T.educator_id = educator_subjects.educator_id
        WHERE  (
          c.title LIKE ? OR 
          c.description LIKE ? OR 
          c.target_exam LIKE ? OR 
          e.name LIKE ?
        )
        ORDER BY c.enrolled_students DESC, c.rating DESC
        LIMIT ?
      `;

      const courses = await database.query(coursesQuery, [
        searchTerm, searchTerm, searchTerm, searchTerm, 
        type === 'course' ? pagination.limit : 5
      ]);

      results.courses = courses.map(course => ({
        id: course.id,
        title: course.title,
        description: course.description,
        educator: {
          name: course.educator_name,
          rating: course.educator_rating,
          isVerified: Boolean(course.educator_verified)
        },
        targetExam: course.target_exam,
        language: course.language,
        price: course.price,
        discountedPrice: course.discounted_price,
        thumbnail: course.thumbnail,
        rating: course.rating,
        enrolledStudents: course.enrolled_students
      }));
    }

    // Search educators if no specific type or type is 'educator'
    if (!type || type === 'educator') {
      const educatorsQuery = `
        SELECT 
          id,
          name,
          subject,
          qualification,
          experience,
          bio,
          rating,
          is_verified
        FROM (educators inner join educator_subjects on educators.id = educator_subjects.educator_id)
        WHERE 
          name LIKE ? OR 
          subject LIKE ? OR 
          qualification LIKE ? OR 
          bio LIKE ?
        ORDER BY rating DESC
        LIMIT ?
      `;

      const educators = await database.query(educatorsQuery, [
        searchTerm, searchTerm, searchTerm, searchTerm,
        type === 'educator' ? pagination.limit : 5
      ]);

      results.educators = educators.map(educator => ({
        id: educator.id,
        name: educator.name,
        subjects: educator.subject,
        qualification: educator.qualification,
        experience: educator.experience,
        bio: educator.bio,
        rating: educator.rating,
        isVerified: Boolean(educator.is_verified)
      }));
    }

    // Search lessons if no specific type or type is 'lesson'
    if (!type || type === 'lesson') {
      const lessonsQuery = `
        SELECT 
          l.id,
          l.title,
          l.description,
          l.duration_seconds,
          l.is_free,
          c.id as course_id,
          c.title as course_title,
          c.thumbnail as course_thumbnail,
          e.name as educator_name
        FROM lessons l
        JOIN courses c ON l.course_id = c.id
        JOIN educators e ON c.educator_id = e.id
        WHERE(
          l.title LIKE ? OR 
          l.description LIKE ? OR
          c.title LIKE ?
        )
        ORDER BY l.is_free DESC, c.enrolled_students DESC
        LIMIT ?
      `;

      const lessons = await database.query(lessonsQuery, [
        searchTerm, searchTerm, searchTerm,
        type === 'lesson' ? pagination.limit : 5
      ]);

      results.lessons = lessons.map(lesson => ({
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        duration: Math.ceil(lesson.duration_seconds / 60) + ' mins',
        isFree: Boolean(lesson.is_free),
        course: {
          id: lesson.course_id,
          title: lesson.course_title,
          thumbnail: lesson.course_thumbnail,
          educator: lesson.educator_name
        }
      }));
    }

    // Search tests if no specific type or type is 'test'
    if (!type || type === 'test') {
      const testsQuery = `
        SELECT 
          t.id,
          t.title,
          t.description,
          t.type,
          t.subject,
          t.total_questions,
          t.duration_minutes,
          t.difficulty,
          c.title as course_title
        FROM tests t
        LEFT JOIN courses c ON t.course_id = c.id
        WHERE t.is_active = 1 AND (
          t.title LIKE ? OR 
          t.description LIKE ? OR 
          t.subject LIKE ?
        )
        ORDER BY t.created_at DESC
        LIMIT ?
      `;

      const tests = await database.query(testsQuery, [
        searchTerm, searchTerm, searchTerm,
        type === 'test' ? pagination.limit : 5
      ]);

      results.tests = tests.map(test => ({
        id: test.id,
        title: test.title,
        description: test.description,
        type: test.type,
        subject: test.subject,
        totalQuestions: test.total_questions,
        duration: test.duration_minutes,
        difficulty: test.difficulty,
        course: test.course_title
      }));
    }

    // Search study materials if no specific type or type is 'material'
    if (!type || type === 'material') {
      const materialsQuery = `
        SELECT 
          sm.id,
          sm.title,
          sm.description,
          sm.type,
          sm.file_size,
          c.title as course_title,
          ch.title as chapter_title
        FROM study_materials sm
        JOIN courses c ON sm.course_id = c.id
        LEFT JOIN course_chapters ch ON sm.chapter_id = ch.id
        WHERE 
          sm.title LIKE ? OR 
          sm.description LIKE ? OR
          c.title LIKE ?
        ORDER BY sm.download_count DESC
        LIMIT ?
      `;

      const materials = await database.query(materialsQuery, [
        searchTerm, searchTerm, searchTerm,
        type === 'material' ? pagination.limit : 5
      ]);

      results.materials = materials.map(material => ({
        id: material.id,
        title: material.title,
        description: material.description,
        type: material.type,
        fileSize: material.file_size,
        course: material.course_title,
        chapter: material.chapter_title
      }));
    }

    // Calculate total results
    const totalResults = Object.values(results).reduce((sum, items) => sum + items.length, 0);

    res.json({
      success: true,
      query,
      totalResults,
      results,
      pagination: type ? {
        page: pagination.page,
        limit: pagination.limit
      } : null
    });

  } catch (error) {
    console.error('Global search error:', error);
    res.status(500).json({
      success: false,
      message: 'Search failed'
    });
  }
};

const searchCourses = async (req, res) => {
  try {
    const { q: query, exam, subject, language, level, educator } = req.query;
    const pagination = paginate(req.query);

    let whereClause = 'WHERE c.is_active = 1';
    const params = [];

    if (query && query.trim().length >= 2) {
      whereClause += ` AND (
        c.title LIKE ? OR 
        c.description LIKE ? OR 
        e.name LIKE ?
      )`;
      const searchTerm = `%${query.trim()}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (exam) {
      whereClause += ' AND c.target_exam = ?';
      params.push(exam);
    }

    if (subject) {
      whereClause += ' AND c.subjects LIKE ?';
      params.push(`%"${subject}"%`);
    }

    if (language) {
      whereClause += ' AND c.language = ?';
      params.push(language);
    }

    if (level) {
      whereClause += ' AND c.level = ?';
      params.push(level);
    }

    if (educator) {
      whereClause += ' AND c.educator_id = ?';
      params.push(educator);
    }

    const coursesQuery = `
      SELECT 
        c.*,
        e.name as educator_name,
        e.rating as educator_rating,
        e.is_verified as educator_verified,
        e.profile_image as educator_image
      FROM courses c
      JOIN educators e ON c.educator_id = e.id
      ${whereClause}
      ORDER BY c.enrolled_students DESC, c.rating DESC
      LIMIT ? OFFSET ?
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM courses c
      JOIN educators e ON c.educator_id = e.id
      ${whereClause}
    `;

    const [coursesResult, countResult] = await Promise.all([
      database.query(coursesQuery, [...params, pagination.limit, pagination.offset]),
      database.query(countQuery, params)
    ]);

    const courses = coursesResult.map(course => ({
      id: course.id,
      title: course.title,
      description: course.description,
      educator: {
        id: course.educator_id,
        name: course.educator_name,
        rating: course.educator_rating,
        isVerified: Boolean(course.educator_verified),
        image: course.educator_image
      },
      targetExam: course.target_exam,
      subjects: course.subjects ? JSON.parse(course.subjects) : [],
      language: course.language,
      level: course.level,
      duration: `${course.duration_months} months`,
      totalLessons: course.total_lessons,
      price: course.price,
      discountedPrice: course.discounted_price,
      thumbnail: course.thumbnail,
      highlights: course.highlights ? JSON.parse(course.highlights) : [],
      rating: course.rating,
      totalRatings: course.total_ratings,
      enrolledStudents: course.enrolled_students,
      courseType: course.course_type,
      createdAt: course.created_at
    }));

    const totalPages = Math.ceil(countResult[0].total / pagination.limit);

    res.json({
      success: true,
      query,
      courses,
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
    console.error('Search courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Course search failed'
    });
  }
};

const getSearchSuggestions = async (req, res) => {
  try {
    const { q: query } = req.query;

    if (!query || query.trim().length < 2) {
      return res.json({
        success: true,
        suggestions: []
      });
    }

    const searchTerm = `%${query.trim()}%`;

    // Get course title suggestions
    const courseSuggestions = await database.query(`
      SELECT DISTINCT title as suggestion, 'course' as type
      FROM courses 
      WHERE is_active = 1 AND title LIKE ?
      ORDER BY enrolled_students DESC
      LIMIT 5
    `, [searchTerm]);

    // Get educator name suggestions
    const educatorSuggestions = await database.query(`
      SELECT DISTINCT name as suggestion, 'educator' as type
      FROM educators 
      WHERE name LIKE ?
      ORDER BY total_students DESC
      LIMIT 5
    `, [searchTerm]);

    // Get subject suggestions
    const subjectSuggestions = await database.query(`
      SELECT DISTINCT 
        CASE 
          WHEN subjects LIKE '%"Physics"%' THEN 'Physics'
          WHEN subjects LIKE '%"Mathematics"%' THEN 'Mathematics'
          WHEN subjects LIKE '%"Chemistry"%' THEN 'Chemistry'
          WHEN subjects LIKE '%"Biology"%' THEN 'Biology'
          WHEN subjects LIKE '%"History"%' THEN 'History'
          WHEN subjects LIKE '%"Economics"%' THEN 'Economics'
        END as suggestion,
        'subject' as type
      FROM courses 
      WHERE is_active = 1 AND subjects LIKE ?
      AND suggestion IS NOT NULL
      LIMIT 3
    `, [searchTerm]);

    // Get exam suggestions
    const examSuggestions = await database.query(`
      SELECT DISTINCT target_exam as suggestion, 'exam' as type
      FROM courses 
      WHERE is_active = 1 AND target_exam LIKE ?
      LIMIT 3
    `, [searchTerm]);

    const allSuggestions = [
      ...courseSuggestions,
      ...educatorSuggestions,
      ...subjectSuggestions,
      ...examSuggestions
    ].slice(0, 10); // Limit to 10 suggestions

    res.json({
      success: true,
      query,
      suggestions: allSuggestions
    });

  } catch (error) {
    console.error('Get search suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch search suggestions'
    });
  }
};

const getPopularSearches = async (req, res) => {
  try {
    // Get popular courses based on enrollment
    const popularCourses = await database.query(`
      SELECT title, enrolled_students
      FROM courses 
      WHERE is_active = 1
      ORDER BY enrolled_students DESC
      LIMIT 5
    `);

    // Get popular educators based on total students
    const popularEducators = await database.query(`
      SELECT name, total_students
      FROM educators 
      ORDER BY total_students DESC
      LIMIT 5
    `);

    // Get popular exams based on course count
    const popularExams = await database.query(`
      SELECT target_exam, COUNT(*) as course_count
      FROM courses 
      WHERE is_active = 1
      GROUP BY target_exam
      ORDER BY course_count DESC
      LIMIT 5
    `);

    // Get popular subjects
    const popularSubjects = [
      { name: 'Physics', type: 'subject' },
      { name: 'Mathematics', type: 'subject' },
      { name: 'Chemistry', type: 'subject' },
      { name: 'Biology', type: 'subject' },
      { name: 'History', type: 'subject' }
    ];

    res.json({
      success: true,
      popular: {
        courses: popularCourses.map(course => ({
          name: course.title,
          type: 'course',
          popularity: course.enrolled_students
        })),
        educators: popularEducators.map(educator => ({
          name: educator.name,
          type: 'educator',
          popularity: educator.total_students
        })),
        exams: popularExams.map(exam => ({
          name: exam.target_exam,
          type: 'exam',
          popularity: exam.course_count
        })),
        subjects: popularSubjects
      }
    });

  } catch (error) {
    console.error('Get popular searches error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch popular searches'
    });
  }
};

module.exports = {
  globalSearch,
  searchCourses,
  getSearchSuggestions,
  getPopularSearches
};