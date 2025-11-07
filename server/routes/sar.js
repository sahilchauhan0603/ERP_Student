const express = require('express');
const router = express.Router();
const sarController = require("../controllers/sarController");
const { authenticate } = require("../middleware/auth");

// Apply authentication middleware to all SAR routes
router.use(authenticate);

// SAR Overview Routes
router.get('/overview', sarController.getSAROverview);
router.put('/overview', sarController.updateSAROverview);

// Academic Records Routes
router.get('/academic', sarController.getAcademicRecords);
router.post('/academic', sarController.createAcademicRecord);
router.put('/academic/:id', sarController.updateAcademicRecord);
router.delete('/academic/:id', sarController.deleteAcademicRecord);

// Internship Records Routes
router.get('/internships', sarController.getInternshipRecords);
router.post('/internships', sarController.createInternshipRecord);
router.put('/internships/:id', sarController.updateInternshipRecord);
router.delete('/internships/:id', sarController.deleteInternshipRecord);

// Achievement Records Routes
router.get('/achievements', sarController.getAchievementRecords);
router.post('/achievements', sarController.createAchievementRecord);
router.put('/achievements/:id', sarController.updateAchievementRecord);
router.delete('/achievements/:id', sarController.deleteAchievementRecord);

// Complete SAR Data Route
router.get('/complete', sarController.getCompleteSAR);

// SAR Statistics Route
router.get('/statistics', sarController.getSARStatistics);

module.exports = router;