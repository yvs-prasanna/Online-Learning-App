const express = require('express');
const database = require('../config/database');
const {getCourses, getCourseById} = require("../models/courseModel")
const { paginate } = require('../utils/helpers');

const getCoursesAPI = async(req, res) => {
    const {exam, subject, language, type, educator, sort} = req.query;

    let conditions = [];
    let values = [];
    let order_by = '';

     if (exam) {
            conditions.push("target_exam = ?");
            values.push(exam);
        }
        if (subject) {
            conditions.push("subject = ?");
            values.push(subject);
        }
        if (language) {
            conditions.push("language = ?");
            values.push(language);
        }
        if (type) {
            conditions.push("type = ?");
            values.push(type);
        }
        if (educator) {
            conditions.push("courses.educator_id = ?");
            values.push(educator);
        }
        if(sort){
            if(sort === "rating"){
                order_by = ("rating DESC");
            }
            else if(sort === "price"){
                order_by =("price ASC");
            }
        }

    const courses = await getCourses(conditions.join(" AND "), values, order_by);
    res.status(200).json({success: true, courses});   
}

const getCourseByID = async(req, res) => {
    const {id} = req.params;
    const course = await getCourseById(id);
    if(course){
        res.status(200).json({success: true, course});
    }
    else{
        res.status(404).json({success: false, message: "Course not found"});
    }
}
const enrollInCourse = async (req, res) => {
  try {
    const userId = req.userId;
    const courseId = req.params.id;

    // Check if course exists
    const course = await database.get(
      'SELECT id, title, price, discounted_price, validity FROM courses WHERE id = ?',
      [courseId]
    );

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if already enrolled
    const existingEnrollment = await database.get(
      'SELECT id FROM enrollments WHERE user_id = ? AND course_id = ? AND is_active = 1',
      [userId, courseId]
    );

    if (existingEnrollment) {
      return res.status(409).json({
        success: false,
        message: 'You are already enrolled in this course'
      });
    }


    // Calculate expiry date
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + parseInt(course.validity));

    // Create enrollment
    const result = await database.run(`
      INSERT INTO enrollments (user_id, course_id, expires_at, purchase_price, payment_method)
      VALUES (?, ?, ?, ?, ?)
    `, [
      userId, 
      courseId, 
      expiryDate.toISOString().slice(0, 19).replace('T', ' '),
      course.discounted_price || course.price,
      'demo' 
    ]);

    // Update course enrollment count
    await database.run(
      'UPDATE courses SET enrolled_students = enrolled_students + 1 WHERE id = ?',
      [courseId]
    );

    res.status(201).json({
      success: true,
      message: 'Successfully enrolled in course',
      enrollment: {
        id: result.lastID,
        courseId: courseId,
        courseTitle: course.title,
        enrolledAt: new Date().toISOString(),
        expiresAt: expiryDate.toISOString(),
        paidAmount: course.discounted_price || course.price
      }
    });

  } catch (error) {
    console.error('Course enrollment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to enroll in course'
    });
  }
};

const getMyEnrollments = async (req, res) => {
  try {
    const userId = req.userId;
    const pagination = paginate(req.query);

    const enrollments = await database.query(`
      SELECT 
        e.id,
        e.enrolled_at,
        e.expires_at,
        e.progress_percentage,
        e.last_accessed,
        e.purchase_price,
        c.id as course_id,
        c.title,
        c.description,
        c.thumbnail,
        c.total_lessons,
        c.rating,
        c.enrolled_students,
        ed.name as educator_name
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      JOIN educators ed ON c.educator_id = ed.id
      WHERE e.user_id = ? AND e.is_active = 1
      ORDER BY e.enrolled_at DESC
      LIMIT ? OFFSET ?
    `, [userId, pagination.limit, pagination.offset]);

    const totalCount = await database.get(
      'SELECT COUNT(*) as total FROM enrollments WHERE user_id = ? AND is_active = 1',
      [userId]
    );

    const enrollmentsData = enrollments.map(enrollment => ({
      id: enrollment.id,
      course: {
        id: enrollment.course_id,
        title: enrollment.title,
        description: enrollment.description,
        thumbnail: enrollment.thumbnail,
        totalLessons: enrollment.total_lessons,
        rating: enrollment.rating,
        enrolledStudents: enrollment.enrolled_students,
        educator: enrollment.educator_name
      },
      enrolledAt: enrollment.enrolled_at,
      expiresAt: enrollment.expires_at,
      progress: enrollment.progress_percentage,
      lastAccessed: enrollment.last_accessed,
      paidAmount: enrollment.purchase_price
    }));

    const totalPages = Math.ceil(totalCount.total / pagination.limit);

    res.json({
      success: true,
      enrollments: enrollmentsData,
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
    console.error('Get enrollments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch enrollments'
    });
  }
};


const addCourseReview = async (req, res) => {
  try {
    const courseId = req.params.id;
    const userId = req.userId;
    const { rating, review } = req.body;

    // Check if course exists
    const course = await database.get(`
      SELECT id, title FROM courses WHERE id = ?
    `, [courseId]);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if user is enrolled in the course
    const enrollment = await database.get(`
      SELECT id FROM enrollments 
      WHERE user_id = ? AND course_id = ? AND is_active = 1
    `, [userId, courseId]);

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: 'You can only review courses you are enrolled in'
      });
    }

    // Check if user has already reviewed this course
    const existingReview = await database.get(`
      SELECT id FROM course_reviews 
      WHERE user_id = ? AND course_id = ?
    `, [userId, courseId]);

    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: 'You have already reviewed this course'
      });
    }

    // Create review
    const result = await database.run(`
      INSERT INTO course_reviews (user_id, course_id, rating, review, is_verified_purchase)
      VALUES (?, ?, ?, ?, 1)
    `, [userId, courseId, rating, review]);

    // Update course rating statistics
    const ratingStats = await database.get(`
      SELECT 
        AVG(rating) as avg_rating,
        COUNT(*) as total_ratings
      FROM course_reviews 
      WHERE course_id = ?
    `, [courseId]);

    await database.run(`
      UPDATE courses 
      SET rating = ?, total_ratings = ?
      WHERE id = ?
    `, [
      Math.round(ratingStats.avg_rating * 10) / 10,
      ratingStats.total_ratings,
      courseId
    ]);

    // Update educator rating
    const educatorRatingStats = await database.get(`
      SELECT 
        AVG(cr.rating) as avg_rating,
        COUNT(cr.rating) as total_ratings
      FROM course_reviews cr
      JOIN courses c ON cr.course_id = c.id
      WHERE c.educator_id = (SELECT educator_id FROM courses WHERE id = ?)
    `, [courseId]);

    await database.run(`
      UPDATE educators 
      SET rating = ?, total_ratings = ?
      WHERE id = (SELECT educator_id FROM courses WHERE id = ?)
    `, [
      Math.round(educatorRatingStats.avg_rating * 10) / 10,
      educatorRatingStats.total_ratings,
      courseId
    ]);

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      review: {
        id: result.lastID,
        rating,
        review,
        courseTitle: course.title,
        createdAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Add course review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add review'
    });
  }
};

module.exports = {
  getCoursesAPI,
  getCourseByID,
  enrollInCourse,
  getMyEnrollments,
  addCourseReview
};
