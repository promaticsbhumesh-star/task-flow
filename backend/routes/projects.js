const express = require('express');
const router = express.Router();
const {
  createProject, getProjects, getProjectById,
  updateProject, deleteProject, addMember, removeMember,
} = require('../controllers/projectController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect); // all project routes require auth

router.route('/')
  .get(getProjects)
  .post(adminOnly, createProject);

router.route('/:id')
  .get(getProjectById)
  .put(adminOnly, updateProject)
  .delete(adminOnly, deleteProject);

router.post('/:id/members',          adminOnly, addMember);
router.delete('/:id/members/:userId', adminOnly, removeMember);

module.exports = router;
