const express = require('express');
const database = require("../config/database")
const {getLiveClassById} = require("../models/liveClassesModel");

const getLiveClassSchedule = async(req, res) => {
    const {courseId, date, upcoming} = req.query;
    const conditions = [];
    const values = [];
    if(courseId){
        conditions.push("course_id = ?");
        values.push(courseId);
    }
    if(date){
        conditions.push("date = ?");
        values.push(date);
    }
    if(upcoming){
        conditions.push("scheduled_at >= ?");
        values.push(new Date().toISOString().split('T')[0]);
    }
    const whereClause = conditions.length > 0? "WHERE " + conditions.join(" AND ") : "";
    const sql = `SELECT * FROM live_classes ${whereClause}`;
    try {
        const liveClasses = await database.query(sql, values);
        return res.status(200).json({
            message: "Live classes retrieved successfully",
            data: liveClasses
        });
    }catch(error){
        console.log(error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

//Join live Class 
const joinLiveClass = async(req, res) => {
    const {liveClassId} = req.params;
    const {userId} = req;
    const liveClassDetails = await getLiveClassById(liveClassId);

     if(!liveClassDetails){
        return res.status(404).json({
            message: "Live class not found"
        });
    }

    const now = new Date();
    const scheduledTime = new Date(liveClassDetails.scheduled_at);
    const classEndTime = new Date(scheduledTime.getTime() + (liveClassDetails.duration_minutes * 60 * 1000));


    if (now < scheduledTime) {
      return res.status(400).json({
        success: false,
        message: 'Live class has not started yet',
        scheduledAt: liveClassDetails.scheduled_at
      });
    }

    if (now > classEndTime && liveClassDetails.status !== 'live') {
      return res.status(400).json({
        success: false,
        message: 'Live class has ended',
        recordingUrl: liveClassDetails.recording_url
      });
    }

    // Check if user is enrolled in the course
    const enrollment = await database.get(`
      SELECT id FROM enrollments 
      WHERE user_id = ? AND course_id = ? AND is_active = 1
      AND (expires_at IS NULL OR expires_at > datetime('now'))
    `, [userId, liveClass.course_id]);

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: 'You need to be enrolled in this course to join the live class'
      });
    }

    // Check capacity
    const attendanceCount = await database.get(`
      SELECT COUNT(*) as count 
      FROM live_class_attendance 
      WHERE live_class_id = ? AND left_at IS NULL
    `, [liveClassId]);

    if (attendanceCount.count >= liveClassDetails.max_students) {
      return res.status(400).json({
        success: false,
        message: 'Live class is at full capacity'
      });
    }

    // Record attendance
    const existingAttendance = await database.get(`
      SELECT id, joined_at, left_at 
      FROM live_class_attendance 
      WHERE live_class_id = ? AND user_id = ?
    `, [liveClassId, userId]);

    if (existingAttendance) {
      if (!existingAttendance.left_at) {
        // User is already in the class
        return res.json({
          success: true,
          message: 'Already joined',
          liveClass: {
            id: liveClassDetails.id,
            title: liveClassDetails.title,
            joinUrl: liveClassDetails.join_url || `https://meet.example.com/class/${liveClassId}`,
            chatEnabled: Boolean(liveClassDetails.chat_enabled),
            pollsEnabled: Boolean(liveClassDetails.polls_enabled),
            duration: liveClassDetails.duration_minutes,
            educator: liveClassDetails.educator_name
          }
        });
      } else {
        // User rejoining
        await database.run(`
          UPDATE live_class_attendance 
          SET joined_at = datetime('now'), left_at = NULL
          WHERE id = ?
        `, [existingAttendance.id]);
      }
    } else {
      // New attendance record
      await database.run(`
        INSERT INTO live_class_attendance (live_class_id, user_id, joined_at)
        VALUES (?, ?, datetime('now'))
      `, [liveClassId, userId]);
    }
    const liveClass = {
        joinUrl : liveClassDetails.join_url,
        token: req.headers.authorization.split(' ')[1],
        chatEnabled : liveClassDetails.chat_enabled,
        pollsEnabled: liveClassDetails.polls_enabled
    }
    try{
        return res.status(200).json({
            success: true,
            liveClass
        });
    }catch(error){
        console.log(error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

//doubts for a live class 
const doubtsForLiveClass = async(req, res) => {
    const {lessonId} = req.params;
    const {userId} = req;

    const query = `select * from doubts where lesson_id = ${lessonId}`;
    const doubts = await database.query(query);
    
    return res.status(200).json({
        message: "Doubts retrieved successfully",
        data: doubts
    }); 
}

const leaveLiveClass = async (req, res) => {
  try {
    const liveClassId = req.params.id;
    const userId = req.userId;

    // Find active attendance record
    const attendance = await database.get(`
      SELECT id, joined_at 
      FROM live_class_attendance 
      WHERE live_class_id = ? AND user_id = ? AND left_at IS NULL
    `, [liveClassId, userId]);

    if (!attendance) {
      return res.status(400).json({
        success: false,
        message: 'You are not currently in this live class'
      });
    }

    // Calculate duration
    const joinedAt = new Date(attendance.joined_at);
    const leftAt = new Date();
    const durationMinutes = Math.round((leftAt - joinedAt) / (1000 * 60));

    // Update attendance record
    await database.run(`
      UPDATE live_class_attendance 
      SET left_at = datetime('now'), duration_minutes = ?
      WHERE id = ?
    `, [durationMinutes, attendance.id]);

    res.json({
      success: true,
      message: 'Successfully left live class',
      duration: durationMinutes
    });

  } catch (error) {
    console.error('Leave live class error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to leave live class'
    });
  }
};

const getMyLiveClasses = async (req, res) => {
  try {
    const userId = req.userId;
    const { status = 'all' } = req.query;
    const pagination = paginate(req.query);

    let statusFilter = '';
    if (status === 'upcoming') {
      statusFilter = 'AND lc.scheduled_at > datetime("now")';
    } else if (status === 'completed') {
      statusFilter = 'AND lc.scheduled_at < datetime("now")';
    }

    const liveClassesQuery = `
      SELECT DISTINCT
        lc.*,
        c.title as course_title,
        e.name as educator_name,
        e.profile_image as educator_image,
        lca.joined_at,
        lca.left_at,
        lca.duration_minutes
      FROM live_classes lc
      JOIN courses c ON lc.course_id = c.id
      JOIN educators e ON lc.educator_id = e.id
      JOIN enrollments en ON c.id = en.course_id
      LEFT JOIN live_class_attendance lca ON lc.id = lca.live_class_id AND lca.user_id = ?
      WHERE en.user_id = ? AND en.is_active = 1
      ${statusFilter}
      ORDER BY lc.scheduled_at DESC
      LIMIT ? OFFSET ?
    `;

    const liveClasses = await database.query(liveClassesQuery, [
      userId, userId, pagination.limit, pagination.offset
    ]);

    const liveClassesData = liveClasses.map(liveClass => ({
      id: liveClass.id,
      title: liveClass.title,
      description: liveClass.description,
      educator: {
        name: liveClass.educator_name,
        image: liveClass.educator_image
      },
      course: {
        id: liveClass.course_id,
        title: liveClass.course_title
      },
      scheduledAt: liveClass.scheduled_at,
      duration: liveClass.duration_minutes,
      status: liveClass.status,
      attendance: liveClass.joined_at ? {
        joinedAt: liveClass.joined_at,
        leftAt: liveClass.left_at,
        duration: liveClass.duration_minutes
      } : null,
      recordingUrl: liveClass.recording_url
    }));

    res.json({
      success: true,
      liveClasses: liveClassesData,
      pagination: {
        page: pagination.page,
        limit: pagination.limit
      }
    });

  } catch (error) {
    console.error('Get my live classes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your live classes'
    });
  }
};

const getLiveClassRecording = async (req, res) => {
  try {
    const liveClassId = req.params.id;
    const userId = req.userId;

    // Get live class details
    const liveClass = await database.get(`
      SELECT 
        lc.*,
        c.title as course_title,
        e.name as educator_name
      FROM live_classes lc
      JOIN courses c ON lc.course_id = c.id
      JOIN educators e ON lc.educator_id = e.id
      WHERE lc.id = ?
    `, [liveClassId]);

    if (!liveClass) {
      return res.status(404).json({
        success: false,
        message: 'Live class not found'
      });
    }

    if (!liveClass.recording_url) {
      return res.status(404).json({
        success: false,
        message: 'Recording not available for this live class'
      });
    }

    // Check if user is enrolled in the course
    const enrollment = await database.get(`
      SELECT id FROM enrollments
      WHERE user_id = ? AND course_id = ? AND is_active = 1
      AND (expires_at IS NULL OR expires_at > datetime('now'))
    `, [userId, liveClass.course_id]);

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: 'You need to be enrolled in this course to access the recording'
      });
    }

    res.json({
      success: true,
      recording: {
        id: liveClass.id,
        title: liveClass.title,
        recordingUrl: liveClass.recording_url,
        duration: liveClass.duration_minutes,
        recordedAt: liveClass.scheduled_at,
        educator: liveClass.educator_name,
        course: liveClass.course_title
      }
    });

  } catch (error) {
    console.error('Get recording error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recording'
    });
  }
};


module.exports = {  
    getLiveClassSchedule,
    joinLiveClass,
    doubtsForLiveClass,
    leaveLiveClass,
  getMyLiveClasses,
  getLiveClassRecording
};
