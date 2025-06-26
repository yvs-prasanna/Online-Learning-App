const database = require('../config/database');
const { generateSecureUrl, formatDuration } = require('../utils/helpers');

const getLessonById = async (req, res) => {
  try {
    const lessonId = req.params.id;
    const userId = req.userId;

    // Get lesson details with course info
    const lesson = await database.get(`
      SELECT 
        l.*,
        c.id as course_id,
        c.title as course_title,
        c.educator_id,
        e.name as educator_name
      FROM lessons l
      JOIN courses c ON l.course_id = c.id
      JOIN educators e ON c.educator_id = e.id
      WHERE l.id = ?
    `, [lessonId]);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }

    // Check if lesson is free or user is enrolled
    if (!lesson.is_free) {
      const enrollment = await database.get(`
        SELECT id FROM enrollments 
        WHERE user_id = ? AND course_id = ? AND is_active = 1
        AND (expires_at IS NULL OR expires_at > datetime('now'))
      `, [userId, lesson.course_id]);

      if (!enrollment) {
        return res.status(403).json({
          success: false,
          message: 'You need to enroll in this course to access this lesson'
        });
      }
    }

    // Get next lesson
    const nextLesson = await database.get(`
      SELECT id, title, is_free
      FROM lessons 
      WHERE course_id = ? AND order_index > ? 
      ORDER BY order_index ASC 
      LIMIT 1
    `, [lesson.course_id, lesson.order_index]);

    // Get previous lesson
    const prevLesson = await database.get(`
      SELECT id, title, is_free
      FROM lessons 
      WHERE course_id = ? AND order_index < ? 
      ORDER BY order_index DESC 
      LIMIT 1
    `, [lesson.course_id, lesson.order_index]);

    // Get user's watch history for this lesson
    const watchHistory = await database.get(`
      SELECT watched_duration, completed, last_watched_at
      FROM watch_history 
      WHERE user_id = ? AND lesson_id = ?
    `, [userId, lessonId]);

    // Get user's notes for this lesson
    const notes = await database.query(`
      SELECT id, timestamp_seconds, note, created_at
      FROM lesson_notes 
      WHERE user_id = ? AND lesson_id = ?
      ORDER BY timestamp_seconds ASC
    `, [userId, lessonId]);

    // Generate secure video URL if lesson has video
    let secureVideoUrl = null;
    if (lesson.video_url) {
      secureVideoUrl = generateSecureUrl(lesson.video_url, 3600); // 1 hour expiry
    }

    const lessonData = {
      id: lesson.id,
      title: lesson.title,
      description: lesson.description,
      videoUrl: secureVideoUrl,
      duration: lesson.duration_seconds,
      formattedDuration: formatDuration(lesson.duration_seconds),
      isFree: Boolean(lesson.is_free),
      resources: lesson.resources ? JSON.parse(lesson.resources) : [],
      course: {
        id: lesson.course_id,
        title: lesson.course_title,
        educator: lesson.educator_name
      },
      navigation: {
        previous: prevLesson ? {
          id: prevLesson.id,
          title: prevLesson.title,
          isFree: Boolean(prevLesson.is_free)
        } : null,
        next: nextLesson ? {
          id: nextLesson.id,
          title: nextLesson.title,
          isFree: Boolean(nextLesson.is_free)
        } : null
      },
      progress: watchHistory ? {
        watchedDuration: watchHistory.watched_duration,
        completed: Boolean(watchHistory.completed),
        lastWatchedAt: watchHistory.last_watched_at,
        progressPercentage: Math.round((watchHistory.watched_duration / lesson.duration_seconds) * 100)
      } : {
        watchedDuration: 0,
        completed: false,
        lastWatchedAt: null,
        progressPercentage: 0
      },
      notes: notes.map(note => ({
        id: note.id,
        timestamp: note.timestamp_seconds,
        note: note.note,
        createdAt: note.created_at
      }))
    };

    res.json({
      success: true,
      lesson: lessonData
    });

  } catch (error) {
    console.error('Get lesson error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lesson details'
    });
  }
};

const updateLessonProgress = async (req, res) => {
  try {
    const lessonId = req.params.id;
    const userId = req.userId;
    const { watchedDuration, totalDuration, completed } = req.body;

    // Verify lesson exists and user has access
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

    // Check enrollment if lesson is not free
    if (!lesson.is_free) {
      const enrollment = await database.get(`
        SELECT id FROM enrollments 
        WHERE user_id = ? AND course_id = ? AND is_active = 1
        AND (expires_at IS NULL OR expires_at > datetime('now'))
      `, [userId, lesson.course_id]);

      if (!enrollment) {
        return res.status(403).json({
          success: false,
          message: 'You are not enrolled in this course'
        });
      }
    }

    // Update or insert watch history
    const existingHistory = await database.get(`
      SELECT id FROM watch_history 
      WHERE user_id = ? AND lesson_id = ?
    `, [userId, lessonId]);

    if (existingHistory) {
      await database.run(`
        UPDATE watch_history 
        SET watched_duration = ?, total_duration = ?, completed = ?, 
            last_watched_at = datetime('now')
        WHERE user_id = ? AND lesson_id = ?
      `, [watchedDuration, totalDuration, completed ? 1 : 0, userId, lessonId]);
    } else {
      await database.run(`
        INSERT INTO watch_history 
        (user_id, lesson_id, watched_duration, total_duration, completed, last_watched_at)
        VALUES (?, ?, ?, ?, ?, datetime('now'))
      `, [userId, lessonId, watchedDuration, totalDuration, completed ? 1 : 0]);
    }

    // Update enrollment progress if enrolled
    if (!lesson.is_free) {
      // Calculate overall course progress
      const progressData = await database.get(`
        SELECT 
          COUNT(*) as total_lessons,
          COUNT(CASE WHEN wh.completed = 1 THEN 1 END) as completed_lessons
        FROM lessons l
        LEFT JOIN watch_history wh ON l.id = wh.lesson_id AND wh.user_id = ?
        WHERE l.course_id = ?
      `, [userId, lesson.course_id]);

      const progressPercentage = progressData.total_lessons > 0 
        ? Math.round((progressData.completed_lessons / progressData.total_lessons) * 100)
        : 0;

      await database.run(`
        UPDATE enrollments 
        SET progress_percentage = ?, last_accessed = datetime('now')
        WHERE user_id = ? AND course_id = ?
      `, [progressPercentage, userId, lesson.course_id]);
    }

    res.json({
      success: true,
      message: 'Progress updated successfully',
      progress: {
        watchedDuration,
        totalDuration,
        completed,
        progressPercentage: Math.round((watchedDuration / totalDuration) * 100)
      }
    });

  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update progress'
    });
  }
};

const saveLessonNote = async (req, res) => {
  try {
    const lessonId = req.params.id;
    const userId = req.userId;
    const { timestamp, note } = req.body;

    // Verify lesson exists and user has access
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

    // Check enrollment if lesson is not free
    if (!lesson.is_free) {
      const enrollment = await database.get(`
        SELECT id FROM enrollments 
        WHERE user_id = ? AND course_id = ? AND is_active = 1
        AND (expires_at IS NULL OR expires_at > datetime('now'))
      `, [userId, lesson.course_id]);

      if (!enrollment) {
        return res.status(403).json({
          success: false,
          message: 'You are not enrolled in this course'
        });
      }
    }

    // Save note
    const result = await database.run(`
      INSERT INTO lesson_notes (user_id, lesson_id, timestamp_seconds, note)
      VALUES (?, ?, ?, ?)
    `, [userId, lessonId, timestamp, note]);

    res.status(201).json({
      success: true,
      message: 'Note saved successfully',
      note: {
        id: result.lastID,
        timestamp,
        note,
        createdAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Save note error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save note'
    });
  }
};

const getLessonNotes = async (req, res) => {
  try {
    const lessonId = req.params.id;
    const userId = req.userId;

    const notes = await database.query(`
      SELECT id, timestamp_seconds, note, created_at, updated_at
      FROM lesson_notes 
      WHERE user_id = ? AND lesson_id = ?
      ORDER BY timestamp_seconds ASC
    `, [userId, lessonId]);

    res.json({
      success: true,
      notes: notes.map(note => ({
        id: note.id,
        timestamp: note.timestamp_seconds,
        note: note.note,
        createdAt: note.created_at,
        updatedAt: note.updated_at
      }))
    });

  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notes'
    });
  }
};

const updateLessonNote = async (req, res) => {
  try {
    const noteId = req.params.noteId;
    const userId = req.userId;
    const { note } = req.body;

    // Verify note belongs to user
    const existingNote = await database.get(`
      SELECT id FROM lesson_notes 
      WHERE id = ? AND user_id = ?
    `, [noteId, userId]);

    if (!existingNote) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    await database.run(`
      UPDATE lesson_notes 
      SET note = ?, updated_at = datetime('now')
      WHERE id = ? AND user_id = ?
    `, [note, noteId, userId]);

    res.json({
      success: true,
      message: 'Note updated successfully'
    });

  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update note'
    });
  }
};

const deleteLessonNote = async (req, res) => {
  try {
    const noteId = req.params.noteId;
    const userId = req.userId;

    // Verify note belongs to user
    const existingNote = await database.get(`
      SELECT id FROM lesson_notes 
      WHERE id = ? AND user_id = ?
    `, [noteId, userId]);

    if (!existingNote) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    await database.run(`
      DELETE FROM lesson_notes 
      WHERE id = ? AND user_id = ?
    `, [noteId, userId]);

    res.json({
      success: true,
      message: 'Note deleted successfully'
    });

  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete note'
    });
  }
};

module.exports = {
  getLessonById,
  updateLessonProgress,
  saveLessonNote,
  getLessonNotes,
  updateLessonNote,
  deleteLessonNote
};