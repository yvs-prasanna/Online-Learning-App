const database = require('../config/database');
const { paginate } = require('../utils/helpers');

const getCourseMaterials = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const userId = req.userId;
    const { type, chapterId } = req.query;

    // Check if user is enrolled in the course
    const enrollment = await database.get(`
      SELECT id FROM enrollments 
      WHERE user_id = ? AND course_id = ? AND is_active = 1
      AND (expires_at IS NULL OR expires_at > datetime('now'))
    `, [userId, courseId]);

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: 'You need to be enrolled in this course to access materials'
      });
    }

    let whereClause = 'WHERE sm.course_id = ?';
    const params = [courseId];

    if (type) {
      whereClause += ' AND sm.type = ?';
      params.push(type);
    }

    if (chapterId) {
      whereClause += ' AND sm.chapter_id = ?';
      params.push(chapterId);
    }

    const materialsQuery = `
      SELECT 
        sm.*,
        ch.title as chapter_title,
        (SELECT COUNT(*) FROM material_downloads WHERE material_id = sm.id AND user_id = ?) as user_downloaded
      FROM study_materials sm
      LEFT JOIN course_chapters ch ON sm.chapter_id = ch.id
      ${whereClause}
      ORDER BY ch.order_index ASC, sm.created_at ASC
    `;

    const materials = await database.query(materialsQuery, [userId, ...params]);

    const materialsData = materials.map(material => ({
      id: material.id,
      title: material.title,
      description: material.description,
      type: material.type,
      fileSize: material.file_size,
      downloadCount: material.download_count,
      isDownloadable: Boolean(material.is_downloadable),
      requiresSubscription: Boolean(material.requires_subscription),
      userDownloaded: Boolean(material.user_downloaded),
      chapter: material.chapter_title ? {
        id: material.chapter_id,
        title: material.chapter_title
      } : null,
      createdAt: material.created_at
    }));

    res.json({
      success: true,
      materials: materialsData
    });

  } catch (error) {
    console.error('Get course materials error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch course materials'
    });
  }
};

const downloadMaterial = async (req, res) => {
  try {
    const materialId = req.params.materialId;
    const userId = req.userId;

    // Get material details
    const material = await database.get(`
      SELECT 
        sm.*,
        c.id as course_id,
        c.title as course_title
      FROM study_materials sm
      JOIN courses c ON sm.course_id = c.id
      WHERE sm.id = ?
    `, [materialId]);

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Study material not found'
      });
    }

    // Check if user is enrolled in the course
    const enrollment = await database.get(`
      SELECT id FROM enrollments 
      WHERE user_id = ? AND course_id = ? AND is_active = 1
      AND (expires_at IS NULL OR expires_at > datetime('now'))
    `, [userId, material.course_id]);

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: 'You need to be enrolled in this course to download materials'
      });
    }

    // Check if material is downloadable
    if (!material.is_downloadable) {
      return res.status(403).json({
        success: false,
        message: 'This material is not available for download'
      });
    }

    // Check subscription requirement
    if (material.requires_subscription) {
      const subscription = await database.get(`
        SELECT id FROM user_subscriptions 
        WHERE user_id = ? AND is_active = 1 AND expires_at > datetime('now')
      `, [userId]);

      if (!subscription) {
        return res.status(403).json({
          success: false,
          message: 'This material requires an active subscription to download'
        });
      }
    }

    // Check if user has already downloaded this material
    const existingDownload = await database.get(`
      SELECT id FROM material_downloads 
      WHERE user_id = ? AND material_id = ?
    `, [userId, materialId]);

    if (!existingDownload) {
      // Record the download
      await database.run(`
        INSERT INTO material_downloads (user_id, material_id)
        VALUES (?, ?)
      `, [userId, materialId]);

      // Update download count
      await database.run(`
        UPDATE study_materials 
        SET download_count = download_count + 1 
        WHERE id = ?
      `, [materialId]);
    }

    // In a real application, you would generate a secure download URL
    // For this demo, we'll return the file URL directly
    const downloadUrl = material.file_url;

    res.json({
      success: true,
      message: 'Download initiated successfully',
      download: {
        id: material.id,
        title: material.title,
        type: material.type,
        fileSize: material.file_size,
        downloadUrl: downloadUrl,
        course: material.course_title
      }
    });

  } catch (error) {
    console.error('Download material error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initiate download'
    });
  }
};

const getMyDownloads = async (req, res) => {
  try {
    const userId = req.userId;
    const { type, courseId } = req.query;
    const pagination = paginate(req.query);

    let whereClause = 'WHERE md.user_id = ?';
    const params = [userId];

    if (type) {
      whereClause += ' AND sm.type = ?';
      params.push(type);
    }

    if (courseId) {
      whereClause += ' AND sm.course_id = ?';
      params.push(courseId);
    }

    const downloadsQuery = `
      SELECT 
        md.*,
        sm.title,
        sm.description,
        sm.type,
        sm.file_size,
        sm.file_url,
        c.title as course_title,
        ch.title as chapter_title
      FROM material_downloads md
      JOIN study_materials sm ON md.material_id = sm.id
      JOIN courses c ON sm.course_id = c.id
      LEFT JOIN course_chapters ch ON sm.chapter_id = ch.id
      ${whereClause}
      ORDER BY md.downloaded_at DESC
      LIMIT ? OFFSET ?
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM material_downloads md
      JOIN study_materials sm ON md.material_id = sm.id
      ${whereClause}
    `;

    const [downloadsResult, countResult] = await Promise.all([
      database.query(downloadsQuery, [...params, pagination.limit, pagination.offset]),
      database.query(countQuery, params)
    ]);

    const downloads = downloadsResult.map(download => ({
      id: download.id,
      downloadedAt: download.downloaded_at,
      material: {
        id: download.material_id,
        title: download.title,
        description: download.description,
        type: download.type,
        fileSize: download.file_size,
        downloadUrl: download.file_url
      },
      course: download.course_title,
      chapter: download.chapter_title
    }));

    const totalPages = Math.ceil(countResult[0].total / pagination.limit);

    res.json({
      success: true,
      downloads,
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
    console.error('Get my downloads error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch download history'
    });
  }
};

const getMaterialById = async (req, res) => {
  try {
    const materialId = req.params.id;
    const userId = req.userId;

    // Get material details
    const material = await database.get(`
      SELECT 
        sm.*,
        c.id as course_id,
        c.title as course_title,
        ch.title as chapter_title,
        (SELECT COUNT(*) FROM material_downloads WHERE material_id = sm.id AND user_id = ?) as user_downloaded
      FROM study_materials sm
      JOIN courses c ON sm.course_id = c.id
      LEFT JOIN course_chapters ch ON sm.chapter_id = ch.id
      WHERE sm.id = ?
    `, [userId, materialId]);

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Study material not found'
      });
    }

    // Check if user is enrolled in the course
    const enrollment = await database.get(`
      SELECT id FROM enrollments 
      WHERE user_id = ? AND course_id = ? AND is_active = 1
      AND (expires_at IS NULL OR expires_at > datetime('now'))
    `, [userId, material.course_id]);

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: 'You need to be enrolled in this course to access this material'
      });
    }

    const materialData = {
      id: material.id,
      title: material.title,
      description: material.description,
      type: material.type,
      fileSize: material.file_size,
      downloadCount: material.download_count,
      isDownloadable: Boolean(material.is_downloadable),
      requiresSubscription: Boolean(material.requires_subscription),
      userDownloaded: Boolean(material.user_downloaded),
      course: {
        id: material.course_id,
        title: material.course_title
      },
      chapter: material.chapter_title ? {
        id: material.chapter_id,
        title: material.chapter_title
      } : null,
      createdAt: material.created_at
    };

    res.json({
      success: true,
      material: materialData
    });

  } catch (error) {
    console.error('Get material by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch material details'
    });
  }
};

const getMaterialsByType = async (req, res) => {
  try {
    const userId = req.userId;
    const { type } = req.params;
    const { courseId } = req.query;
    const pagination = paginate(req.query);

    let whereClause = `WHERE sm.type = ? AND EXISTS (
      SELECT 1 FROM enrollments e 
      WHERE e.user_id = ? AND e.course_id = sm.course_id 
      AND e.is_active = 1 AND (e.expires_at IS NULL OR e.expires_at > datetime('now'))
    )`;
    const params = [type, userId];

    if (courseId) {
      whereClause += ' AND sm.course_id = ?';
      params.push(courseId);
    }

    const materialsQuery = `
      SELECT 
        sm.*,
        c.title as course_title,
        ch.title as chapter_title,
        (SELECT COUNT(*) FROM material_downloads WHERE material_id = sm.id AND user_id = ?) as user_downloaded
      FROM study_materials sm
      JOIN courses c ON sm.course_id = c.id
      LEFT JOIN course_chapters ch ON sm.chapter_id = ch.id
      ${whereClause}
      ORDER BY c.title ASC, ch.order_index ASC, sm.created_at ASC
      LIMIT ? OFFSET ?
    `;

    const materials = await database.query(materialsQuery, [
      userId, ...params, pagination.limit, pagination.offset
    ]);

    const materialsData = materials.map(material => ({
      id: material.id,
      title: material.title,
      description: material.description,
      type: material.type,
      fileSize: material.file_size,
      downloadCount: material.download_count,
      isDownloadable: Boolean(material.is_downloadable),
      requiresSubscription: Boolean(material.requires_subscription),
      userDownloaded: Boolean(material.user_downloaded),
      course: {
        id: material.course_id,
        title: material.course_title
      },
      chapter: material.chapter_title ? {
        id: material.chapter_id,
        title: material.chapter_title
      } : null,
      createdAt: material.created_at
    }));

    res.json({
      success: true,
      materials: materialsData,
      pagination: {
        page: pagination.page,
        limit: pagination.limit
      }
    });

  } catch (error) {
    console.error('Get materials by type error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch materials'
    });
  }
};

module.exports = {
  getCourseMaterials,
  downloadMaterial,
  getMyDownloads,
  getMaterialById,
  getMaterialsByType
};