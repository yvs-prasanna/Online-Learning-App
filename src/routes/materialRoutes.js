const express = require('express');
const router = express.Router();
const {getCourseMaterials,
  downloadMaterial,
  getMyDownloads,
  getMaterialById,
  getMaterialsByType} = require('../controllers/materialController');
const {authorizeUser} = require('../middlewares/authorizeUser');



router.get('/course/:courseId/', authorizeUser, getCourseMaterials);
router.get('/:materialId/download', authorizeUser, downloadMaterial);
router.get('/my-downloads', authorizeUser, getMyDownloads);
router.get('/:courseId/materials/:materialId', authorizeUser, getMaterialById);
router.get('/:courseId/materials/:type', authorizeUser, getMaterialsByType);

module.exports = router;