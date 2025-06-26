const database = require('../config/database');
const { paginate } = require('../utils/helpers');

const postDoubt = async (req, res) => {
  try {
    const userId = req.userId;
    const { courseId, lessonId, question, attachments } = req.body;

    // Validate that user has access to the course/lesson if specified
    if (courseId) {
      const enrollment = await database.get(`
        SELECT id FROM enrollments 
        WHERE user_id = ? AND course_id = ? AND is_active = 1
        AND (expires_at IS NULL OR expires_at > datetime('now'))
      `, [userId, courseId]);

      if (!enrollment) {
        return res.status(403).json({
          success: false,
          message: 'You need to be enrolled in this course to post doubts'
        });
      }
    }

    if (lessonId) {
      const lesson = await database.get(`
        SELECT l.*, c.id as course_id
        FROM lessons l
        JOIN courses c ON l.course_id = c.id
        WHERE l.id = ?
      `, [lessonId]);

      if (!lesson) {
        return res.status(404).json({
          success: false,
          message: 'Lesson not found'
        });
      }

      // Check access to lesson
      if (!lesson.is_free) {
        const enrollment = await database.get(`
          SELECT id FROM enrollments 
          WHERE user_id = ? AND course_id = ? AND is_active = 1
          AND (expires_at IS NULL OR expires_at > datetime('now'))
        `, [userId, lesson.course_id]);

        if (!enrollment) {
          return res.status(403).json({
            success: false,
            message: 'You need to be enrolled in this course to post doubts about this lesson'
          });
        }
      }
    }

    // Create doubt record
    const result = await database.run(`
      INSERT INTO doubts (user_id, course_id, lesson_id, question, attachments)
      VALUES (?, ?, ?, ?, ?)
    `, [
      userId,
      courseId || null,
      lessonId || null,
      question,
      attachments ? JSON.stringify(attachments) : null
    ]);

    // Get the created doubt with additional details
    const doubt = await database.get(`
      SELECT 
        d.*,
        u.name as user_name,
        c.title as course_title,
        l.title as lesson_title
      FROM doubts d
      JOIN users u ON d.user_id = u.id
      LEFT JOIN courses c ON d.course_id = c.id
      LEFT JOIN lessons l ON d.lesson_id = l.id
      WHERE d.id = ?
    `, [result.lastID]);

    res.status(201).json({
      success: true,
      message: 'Doubt posted successfully',
      doubt: {
        id: doubt.id,
        question: doubt.question,
        attachments: doubt.attachments ? JSON.parse(doubt.attachments) : [],
        status: doubt.status,
        priority: doubt.priority,
        createdAt: doubt.created_at,
        user: doubt.user_name,
        course: doubt.course_title,
        lesson: doubt.lesson_title
      }
    });

  } catch (error) {
    console.error('Post doubt error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to post doubt'
    });
  }
};

const getMyDoubts = async (req, res) => {
  try {
    const userId = req.userId;
    const { status, courseId } = req.query;
    const pagination = paginate(req.query);

    let whereClause = 'WHERE d.user_id = ?';
    const params = [userId];

    if (status) {
      whereClause += ' AND d.status = ?';
      params.push(status);
    }

    if (courseId) {
      whereClause += ' AND d.course_id = ?';
      params.push(courseId);
    }

    const doubtsQuery = `
      SELECT 
        d.*,
        c.title as course_title,
        l.title as lesson_title,
        (SELECT COUNT(*) FROM doubt_answers WHERE doubt_id = d.id) as answer_count
      FROM doubts d
      LEFT JOIN courses c ON d.course_id = c.id
      LEFT JOIN lessons l ON d.lesson_id = l.id
      ${whereClause}
      ORDER BY d.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM doubts d
      ${whereClause}
    `;

    const [doubtsResult, countResult] = await Promise.all([
      database.query(doubtsQuery, [...params, pagination.limit, pagination.offset]),
      database.query(countQuery, params)
    ]);

    const doubts = doubtsResult.map(doubt => ({
      id: doubt.id,
      question: doubt.question,
      attachments: doubt.attachments ? JSON.parse(doubt.attachments) : [],
      status: doubt.status,
      priority: doubt.priority,
      answerCount: doubt.answer_count,
      createdAt: doubt.created_at,
      updatedAt: doubt.updated_at,
      course: doubt.course_title ? {
        id: doubt.course_id,
        title: doubt.course_title
      } : null,
      lesson: doubt.lesson_title ? {
        id: doubt.lesson_id,
        title: doubt.lesson_title
      } : null
    }));

    const totalPages = Math.ceil(countResult[0].total / pagination.limit);

    res.json({
      success: true,
      doubts,
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
    console.error('Get my doubts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch doubts'
    });
  }
};

const getDoubtById = async (req, res) => {
  try {
    const doubtId = req.params.id;
    const userId = req.userId;

    // Get doubt details
    const doubt = await database.get(`
      SELECT 
        d.*,
        u.name as user_name,
        u.profile_image as user_image,
        c.title as course_title,
        l.title as lesson_title
      FROM doubts d
      JOIN users u ON d.user_id = u.id
      LEFT JOIN courses c ON d.course_id = c.id
      LEFT JOIN lessons l ON d.lesson_id = l.id
      WHERE d.id = ?
    `, [doubtId]);

    if (!doubt) {
      return res.status(404).json({
        success: false,
        message: 'Doubt not found'
      });
    }

    // Check if user has access to view this doubt
    if (doubt.user_id !== userId && req.user.role !== 'educator') {
      // Check if user is enrolled in the same course
      if (doubt.course_id) {
        const enrollment = await database.get(`
          SELECT id FROM enrollments 
          WHERE user_id = ? AND course_id = ? AND is_active = 1
        `, [userId, doubt.course_id]);

        if (!enrollment) {
          return res.status(403).json({
            success: false,
            message: 'You do not have access to view this doubt'
          });
        }
      }
    }

    // Get answers for this doubt
    const answers = await database.query(`
      SELECT 
        da.*,
        e.name as educator_name,
        e.profile_image as educator_image,
        e.qualification as educator_qualification,
        e.is_verified as educator_verified
      FROM doubt_answers da
      JOIN educators e ON da.educator_id = e.id
      WHERE da.doubt_id = ?
      ORDER BY da.is_accepted DESC, da.upvotes DESC, da.created_at ASC
    `, [doubtId]);

    const doubtData = {
      id: doubt.id,
      question: doubt.question,
      attachments: doubt.attachments ? JSON.parse(doubt.attachments) : [],
      status: doubt.status,
      priority: doubt.priority,
      createdAt: doubt.created_at,
      updatedAt: doubt.updated_at,
      user: {
        id: doubt.user_id,
        name: doubt.user_name,
        image: doubt.user_image
      },
      course: doubt.course_title ? {
        id: doubt.course_id,
        title: doubt.course_title
      } : null,
      lesson: doubt.lesson_title ? {
        id: doubt.lesson_id,
        title: doubt.lesson_title
      } : null,
      answers: answers.map(answer => ({
        id: answer.id,
        answer: answer.answer,
        attachments: answer.attachments ? JSON.parse(answer.attachments) : [],
        isAccepted: Boolean(answer.is_accepted),
        upvotes: answer.upvotes,
        downvotes: answer.downvotes,
        createdAt: answer.created_at,
        educator: {
          id: answer.educator_id,
          name: answer.educator_name,
          image: answer.educator_image,
          qualification: answer.educator_qualification,
          isVerified: Boolean(answer.educator_verified)
        }
      }))
    };

    res.json({
      success: true,
      doubt: doubtData
    });

  } catch (error) {
    console.error('Get doubt by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch doubt details'
    });
  }
};

const answerDoubt = async (req, res) => {
  try {
    const doubtId = req.params.id;
    const educatorId = req.userId;
    const { answer, attachments, role } = req.body;

    // Verify user is an educator
    if (role !== 'educator') {
      return res.status(403).json({
        success: false,
        message: 'Only educators can answer doubts'
      });
    }

    // Check if doubt exists
    const doubt = await database.get(`
      SELECT id, status FROM doubts WHERE id = ?
    `, [doubtId]);

    if (!doubt) {
      return res.status(404).json({
        success: false,
        message: 'Doubt not found'
      });
    }

    // Create answer record
    const result = await database.run(`
      INSERT INTO doubt_answers (doubt_id, educator_id, answer, attachments)
      VALUES (?, ?, ?, ?)
    `, [
      doubtId,
      educatorId,
      answer,
      attachments ? JSON.stringify(attachments) : null
    ]);

    // Update doubt status to answered if it was pending
    if (doubt.status === 'pending') {
      await database.run(`
        UPDATE doubts 
        SET status = 'answered', updated_at = datetime('now')
        WHERE id = ?
      `, [doubtId]);
    }

    // Get the created answer with educator details
    const answerData = await database.get(`
      SELECT 
        da.*,
        e.name as educator_name,
        e.qualification as educator_qualification
      FROM doubt_answers da
      JOIN educators e ON da.educator_id = e.id
      WHERE da.id = ?
    `, [result.lastID]);

    res.status(201).json({
      success: true,
      message: 'Answer posted successfully',
      answer: {
        id: answerData.id,
        answer: answerData.answer,
        attachments: answerData.attachments ? JSON.parse(answerData.attachments) : [],
        upvotes: answerData.upvotes,
        downvotes: answerData.downvotes,
        createdAt: answerData.created_at,
        educator: {
          id: answerData.educator_id,
          name: answerData.educator_name,
          qualification: answerData.educator_qualification
        }
      }
    });

  } catch (error) {
    console.error('Answer doubt error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to post answer'
    });
  }
};

const acceptAnswer = async (req, res) => {
  try {
    const answerId = req.params.answerId;
    const userId = req.userId;

    // Get answer and doubt details
    const answerData = await database.get(`
      SELECT 
        da.id,
        da.doubt_id,
        d.user_id as doubt_owner
      FROM doubt_answers da
      JOIN doubts d ON da.doubt_id = d.id
      WHERE da.id = ?
    `, [answerId]);

    if (!answerData) {
      return res.status(404).json({
        success: false,
        message: 'Answer not found'
      });
    }

    // Check if user owns the doubt
    if (answerData.doubt_owner !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only accept answers to your own doubts'
      });
    }

    // Unaccept any previously accepted answers for this doubt
    await database.run(`
      UPDATE doubt_answers 
      SET is_accepted = 0 
      WHERE doubt_id = ?
    `, [answerData.doubt_id]);

    // Accept this answer
    await database.run(`
      UPDATE doubt_answers 
      SET is_accepted = 1 
      WHERE id = ?
    `, [answerId]);

    // Update doubt status to resolved
    await database.run(`
      UPDATE doubts 
      SET status = 'resolved', updated_at = datetime('now')
      WHERE id = ?
    `, [answerData.doubt_id]);

    res.json({
      success: true,
      message: 'Answer accepted successfully'
    });

  } catch (error) {
    console.error('Accept answer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to accept answer'
    });
  }
};

const voteAnswer = async (req, res) => {
  try {
    const answerId = req.params.answerId;
    const { voteType } = req.body; // 'upvote' or 'downvote'

    if (!['upvote', 'downvote'].includes(voteType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid vote type. Must be "upvote" or "downvote"'
      });
    }

    // Check if answer exists
    const answer = await database.get(`
      SELECT id, upvotes, downvotes FROM doubt_answers WHERE id = ?
    `, [answerId]);

    if (!answer) {
      return res.status(404).json({
        success: false,
        message: 'Answer not found'
      });
    }

    // Update vote count
    if (voteType === 'upvote') {
      await database.run(`
        UPDATE doubt_answers 
        SET upvotes = upvotes + 1 
        WHERE id = ?
      `, [answerId]);
    } else {
      await database.run(`
        UPDATE doubt_answers 
        SET downvotes = downvotes + 1 
        WHERE id = ?
      `, [answerId]);
    }

    // Get updated vote counts
    const updatedAnswer = await database.get(`
      SELECT upvotes, downvotes FROM doubt_answers WHERE id = ?
    `, [answerId]);

    res.json({
      success: true,
      message: `${voteType} recorded successfully`,
      votes: {
        upvotes: updatedAnswer.upvotes,
        downvotes: updatedAnswer.downvotes
      }
    });

  } catch (error) {
    console.error('Vote answer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record vote'
    });
  }
};

const getDoubtsForEducator = async (req, res) => {
  try {
    const educatorId = req.userId;
    const { status, courseId, priority } = req.query;
    const pagination = paginate(req.query);

    // Verify user is an educator
    if (req.user.role !== 'educator') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Educator role required.'
      });
    }

    let whereClause = `WHERE (d.course_id IN (
      SELECT id FROM courses WHERE educator_id = ?
    ) OR d.course_id IS NULL)`;
    const params = [educatorId];

    if (status) {
      whereClause += ' AND d.status = ?';
      params.push(status);
    }

    if (courseId) {
      whereClause += ' AND d.course_id = ?';
      params.push(courseId);
    }

    if (priority) {
      whereClause += ' AND d.priority = ?';
      params.push(priority);
    }

    const doubtsQuery = `
      SELECT 
        d.*,
        u.name as user_name,
        u.profile_image as user_image,
        c.title as course_title,
        l.title as lesson_title,
        (SELECT COUNT(*) FROM doubt_answers WHERE doubt_id = d.id) as answer_count,
        (SELECT COUNT(*) FROM doubt_answers WHERE doubt_id = d.id AND educator_id = ?) as my_answers
      FROM doubts d
      JOIN users u ON d.user_id = u.id
      LEFT JOIN courses c ON d.course_id = c.id
      LEFT JOIN lessons l ON d.lesson_id = l.id
      ${whereClause}
      ORDER BY 
        CASE d.priority 
          WHEN 'high' THEN 1 
          WHEN 'normal' THEN 2 
          WHEN 'low' THEN 3 
        END,
        d.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const doubts = await database.query(doubtsQuery, [
      educatorId, ...params, pagination.limit, pagination.offset
    ]);

    const doubtsData = doubts.map(doubt => ({
      id: doubt.id,
      question: doubt.question,
      status: doubt.status,
      priority: doubt.priority,
      answerCount: doubt.answer_count,
      myAnswers: doubt.my_answers,
      createdAt: doubt.created_at,
      user: {
        name: doubt.user_name,
        image: doubt.user_image
      },
      course: doubt.course_title ? {
        id: doubt.course_id,
        title: doubt.course_title
      } : null,
      lesson: doubt.lesson_title ? {
        id: doubt.lesson_id,
        title: doubt.lesson_title
      } : null
    }));

    res.json({
      success: true,
      doubts: doubtsData,
      pagination: {
        page: pagination.page,
        limit: pagination.limit
      }
    });

  } catch (error) {
    console.error('Get doubts for educator error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch doubts'
    });
  }
};

module.exports = {
  postDoubt,
  getMyDoubts,
  getDoubtById,
  answerDoubt,
  acceptAnswer,
  voteAnswer,
  getDoubtsForEducator
};