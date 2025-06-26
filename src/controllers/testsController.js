const database = require('../config/database')
const {generateSessionId, calculateRank} = require('../utils/helpers')

const getTests = async(req, res) => {
    const {courseId, type, subject} = req.query;
    
    const conditions = []
    const values = []

    if(courseId){
        conditions.push('course_id =?')
        values.push(courseId)
    }
    if(type){
        conditions.push('type =?')
        values.push(type)
    }
    if(subject){
        conditions.push('subject =?')
        values.push(subject)
    }

    if(conditions.length > 0){
        const sql = `select * from tests where ${conditions.join(' and ')}`;
        const tests = await database.query(sql, values);
        res.status(200).json(tests);
    }else{
        res.status(400).json({message: 'Please provide at least one parameter to filter tests.'});
    }
}

const getTestById = async (req, res) => {
  try {
    const testId = req.params.id;
    const userId = req.userId;

    // Get test details
    const test = await database.get(`
      SELECT 
        t.*,
        c.title as course_title
      FROM tests t
      LEFT JOIN courses c ON t.course_id = c.id
      WHERE t.id = ? AND t.is_active = 1
    `, [testId]);

    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Test not found'
      });
    }

    // Check if user has access (if test is course-specific)
    if (test.course_id) {
      const enrollment = await database.get(`
        SELECT id FROM enrollments 
        WHERE user_id = ? AND course_id = ? AND is_active = 1
        AND (expires_at IS NULL OR expires_at > datetime('now'))
      `, [userId, test.course_id]);

      if (!enrollment) {
        return res.status(403).json({
          success: false,
          message: 'You need to be enrolled in this course to access this test'
        });
      }
    }

    // Get user's previous attempts
    const attempts = await database.query(`
      SELECT 
        id,
        started_at,
        submitted_at,
        total_score,
        max_score,
        percentage,
        rank_position,
        percentile,
        status
      FROM test_attempts 
      WHERE user_id = ? AND test_id = ?
      ORDER BY started_at DESC
    `, [userId, testId]);

    // Get test statistics
    const stats = await database.get(`
      SELECT 
        COUNT(*) as total_attempts,
        AVG(total_score) as avg_score,
        MAX(total_score) as highest_score,
        MIN(total_score) as lowest_score
      FROM test_attempts 
      WHERE test_id = ? AND status = 'submitted'
    `, [testId]);

    const testData = {
      id: test.id,
      title: test.title,
      description: test.description,
      type: test.type,
      subject: test.subject,
      totalQuestions: test.total_questions,
      duration: test.duration_minutes,
      maxMarks: test.max_marks,
      difficulty: test.difficulty,
      negativeMarking: Boolean(test.negative_marking),
      instructions: test.instructions,
      course: test.course_title ? {
        id: test.course_id,
        title: test.course_title
      } : null,
      attempts: attempts.map(attempt => ({
        id: attempt.id,
        startedAt: attempt.started_at,
        submittedAt: attempt.submitted_at,
        score: attempt.total_score,
        maxScore: attempt.max_score,
        percentage: attempt.percentage,
        rank: attempt.rank_position,
        percentile: attempt.percentile,
        status: attempt.status
      })),
      statistics: {
        totalAttempts: stats.total_attempts || 0,
        avgScore: stats.avg_score ? Math.round(stats.avg_score) : 0,
        highestScore: stats.highest_score || 0,
        lowestScore: stats.lowest_score || 0
      }
    };

    res.json({
      success: true,
      test: testData
    });

  } catch (error) {
    console.error('Get test by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch test details'
    });
  }
};

const startTest = async (req, res) => {
  try {
    const testId = req.params.id;
    const userId = req.userId;

    // Get test details
    const test = await database.get(`
      SELECT * FROM tests 
      WHERE id = ? AND is_active = 1
    `, [testId]);

    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Test not found'
      });
    }

    // Check if user has access (if test is course-specific)
    if (test.course_id) {
      const enrollment = await database.get(`
        SELECT id FROM enrollments 
        WHERE user_id = ? AND course_id = ? AND is_active = 1
        AND (expires_at IS NULL OR expires_at > datetime('now'))
      `, [userId, test.course_id]);

      if (!enrollment) {
        return res.status(403).json({
          success: false,
          message: 'You need to be enrolled in this course to take this test'
        });
      }
    }

    // Check if user has an active session for this test
    const activeSession = await database.get(`
      SELECT session_id FROM test_attempts 
      WHERE user_id = ? AND test_id = ? AND status = 'started'
    `, [userId, testId]);

    if (activeSession) {
      return res.status(409).json({
        success: false,
        message: 'You already have an active session for this test',
        sessionId: activeSession.session_id
      });
    }

    // Generate session ID
    const sessionId = generateSessionId();

    // Get test questions
    const questions = await database.query(`
      SELECT 
        id,
        question,
        options,
        marks,
        negative_marks,
        subject,
        topic,
        difficulty
      FROM test_questions 
      WHERE test_id = ?
      ORDER BY RANDOM()
    `, [testId]);

    if (questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No questions available for this test'
      });
    }

    // Calculate end time
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + (test.duration_minutes * 60 * 1000));

    // Create test attempt record
    await database.run(`
      INSERT INTO test_attempts 
      (user_id, test_id, session_id, started_at, max_score, status)
      VALUES (?, ?, ?, ?, ?, 'started')
    `, [userId, testId, sessionId, startTime.toISOString(), test.max_marks]);

    // Format questions for response (without correct answers)
    const formattedQuestions = questions.map((question, index) => ({
      id: question.id,
      questionNumber: index + 1,
      question: question.question,
      options: JSON.parse(question.options),
      marks: question.marks,
      negativeMarks: question.negative_marks,
      subject: question.subject,
      topic: question.topic,
      difficulty: question.difficulty
    }));

    res.json({
      success: true,
      message: 'Test started successfully',
      testSession: {
        sessionId,
        testId: test.id,
        title: test.title,
        totalQuestions: test.total_questions,
        duration: test.duration_minutes,
        maxMarks: test.max_marks,
        negativeMarking: Boolean(test.negative_marking),
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        questions: formattedQuestions,
        instructions: test.instructions
      }
    });

  } catch (error) {
    console.error('Start test error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start test'
    });
  }
};

const submitTest = async (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    const userId = req.userId;
    const { answers, timeSpent } = req.body;

    // Get test attempt
    const attempt = await database.get(`
      SELECT ta.*, t.max_marks, t.negative_marking
      FROM test_attempts ta
      JOIN tests t ON ta.test_id = t.id
      WHERE ta.session_id = ? AND ta.user_id = ? AND ta.status = 'started'
    `, [sessionId, userId]);

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Test session not found or already submitted'
      });
    }

    // Get correct answers
    const questions = await database.query(`
      SELECT id, correct_option, marks, negative_marks
      FROM test_questions 
      WHERE test_id = ?
    `, [attempt.test_id]);

    const questionMap = {};
    questions.forEach(q => {
      questionMap[q.id] = q;
    });

    // Calculate score
    let totalScore = 0;
    let correct = 0;
    let incorrect = 0;
    let unattempted = 0;
    const answerMap = {};

    // Process answers
    answers.forEach(answer => {
      answerMap[answer.questionId] = answer.selectedOption;
      const question = questionMap[answer.questionId];
      
      if (question) {
        if (answer.selectedOption === question.correct_option) {
          totalScore += question.marks;
          correct++;
        } else if (answer.selectedOption !== null && answer.selectedOption !== undefined) {
          if (attempt.negative_marking) {
            totalScore -= question.negative_marks;
          }
          incorrect++;
        }
      }
    });

    // Count unattempted
    unattempted = questions.length - (correct + incorrect);

    // Calculate percentage
    const percentage = (totalScore / attempt.max_marks) * 100;

    // Get total attempts for ranking
    const totalAttempts = await database.get(`
      SELECT COUNT(*) as count 
      FROM test_attempts 
      WHERE test_id = ? AND status = 'submitted'
    `, [attempt.test_id]);

    // Calculate rank and percentile
    const rankData = calculateRank(totalScore, totalAttempts.count + 1);

    // Subject-wise analysis
    const subjectAnalysis = {};
    questions.forEach(question => {
      if (!subjectAnalysis[question.subject]) {
        subjectAnalysis[question.subject] = {
          total: 0,
          correct: 0,
          score: 0,
          maxScore: 0
        };
      }
      
      subjectAnalysis[question.subject].total++;
      subjectAnalysis[question.subject].maxScore += question.marks;
      
      const userAnswer = answerMap[question.id];
      if (userAnswer === question.correct_option) {
        subjectAnalysis[question.subject].correct++;
        subjectAnalysis[question.subject].score += question.marks;
      } else if (userAnswer !== null && userAnswer !== undefined && attempt.negative_marking) {
        subjectAnalysis[question.subject].score -= question.negative_marks;
      }
    });

    // Calculate accuracy for each subject
    Object.keys(subjectAnalysis).forEach(subject => {
      const analysis = subjectAnalysis[subject];
      analysis.accuracy = analysis.total > 0 ? (analysis.correct / analysis.total) * 100 : 0;
    });

    // Update test attempt
    await database.run(`
      UPDATE test_attempts 
      SET 
        submitted_at = datetime('now'),
        time_spent_seconds = ?,
        total_score = ?,
        percentage = ?,
        rank_position = ?,
        percentile = ?,
        answers = ?,
        analysis = ?,
        status = 'submitted'
      WHERE session_id = ? AND user_id = ?
    `, [
      timeSpent,
      totalScore,
      percentage,
      rankData.rank,
      rankData.percentile,
      JSON.stringify(answerMap),
      JSON.stringify(subjectAnalysis),
      sessionId,
      userId
    ]);

    res.json({
      success: true,
      message: 'Test submitted successfully',
      result: {
        sessionId,
        score: totalScore,
        maxScore: attempt.max_marks,
        percentage: Math.round(percentage * 100) / 100,
        rank: rankData.rank,
        percentile: rankData.percentile,
        correct,
        incorrect,
        unattempted,
        timeSpent,
        analysis: subjectAnalysis
      }
    });

  } catch (error) {
    console.error('Submit test error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit test'
    });
  }
};

const getTestResult = async (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    const userId = req.userId;

    // Get test attempt with result
    const attempt = await database.get(`
      SELECT 
        ta.*,
        t.title,
        t.total_questions,
        t.max_marks,
        t.duration_minutes
      FROM test_attempts ta
      JOIN tests t ON ta.test_id = t.id
      WHERE ta.session_id = ? AND ta.user_id = ? AND ta.status = 'submitted'
    `, [sessionId, userId]);

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Test result not found'
      });
    }

    // Parse stored data
    const answers = attempt.answers ? JSON.parse(attempt.answers) : {};
    const analysis = attempt.analysis ? JSON.parse(attempt.analysis) : {};

    // Get questions with correct answers for detailed review
    const questions = await database.query(`
      SELECT 
        id,
        question,
        options,
        correct_option,
        explanation,
        marks,
        negative_marks,
        subject,
        topic
      FROM test_questions 
      WHERE test_id = ?
    `, [attempt.test_id]);

    const detailedQuestions = questions.map(question => ({
      id: question.id,
      question: question.question,
      options: JSON.parse(question.options),
      correctOption: question.correct_option,
      userAnswer: answers[question.id] !== undefined ? answers[question.id] : null,
      explanation: question.explanation,
      marks: question.marks,
      negativeMarks: question.negative_marks,
      subject: question.subject,
      topic: question.topic,
      isCorrect: answers[question.id] === question.correct_option,
      isAttempted: answers[question.id] !== undefined && answers[question.id] !== null
    }));

    res.json({
      success: true,
      result: {
        sessionId: attempt.session_id,
        testTitle: attempt.title,
        submittedAt: attempt.submitted_at,
        timeSpent: attempt.time_spent_seconds,
        score: attempt.total_score,
        maxScore: attempt.max_score,
        percentage: attempt.percentage,
        rank: attempt.rank_position,
        percentile: attempt.percentile,
        totalQuestions: attempt.total_questions,
        analysis,
        questions: detailedQuestions
      }
    });

  } catch (error) {
    console.error('Get test result error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch test result'
    });
  }
};

const getMyTestAttempts = async (req, res) => {
  try {
    const userId = req.userId;
    const { testId, status } = req.query;
    const pagination = paginate(req.query);

    let whereClause = 'WHERE ta.user_id = ?';
    const params = [userId];

    if (testId) {
      whereClause += ' AND ta.test_id = ?';
      params.push(testId);
    }

    if (status) {
      whereClause += ' AND ta.status = ?';
      params.push(status);
    }

    const attemptsQuery = `
      SELECT 
        ta.*,
        t.title,
        t.type,
        t.subject,
        t.total_questions,
        t.max_marks,
        t.duration_minutes
      FROM test_attempts ta
      JOIN tests t ON ta.test_id = t.id
      ${whereClause}
      ORDER BY ta.started_at DESC
      LIMIT ? OFFSET ?
    `;

    const attempts = await database.query(attemptsQuery, [
      ...params, pagination.limit, pagination.offset
    ]);

    const attemptsData = attempts.map(attempt => ({
      id: attempt.id,
      sessionId: attempt.session_id,
      test: {
        id: attempt.test_id,
        title: attempt.title,
        type: attempt.type,
        subject: attempt.subject,
        totalQuestions: attempt.total_questions,
        maxMarks: attempt.max_marks,
        duration: attempt.duration_minutes
      },
      startedAt: attempt.started_at,
      submittedAt: attempt.submitted_at,
      timeSpent: attempt.time_spent_seconds,
      score: attempt.total_score,
      maxScore: attempt.max_score,
      percentage: attempt.percentage,
      rank: attempt.rank_position,
      percentile: attempt.percentile,
      status: attempt.status
    }));

    res.json({
      success: true,
      attempts: attemptsData,
      pagination: {
        page: pagination.page,
        limit: pagination.limit
      }
    });

  } catch (error) {
    console.error('Get my test attempts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch test attempts'
    });
  }
};

module.exports = {
  getTests,
  getTestById,
  startTest,
  submitTest,
  getTestResult,
  getMyTestAttempts
};
