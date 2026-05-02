const express = require('express');
const router = express.Router();
const { createTask, getTasks, getTaskById, updateTask, deleteTask } = require('../controllers/taskController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getTasks)
  .post(adminOnly, createTask);

router.route('/:id')
  .get(getTaskById)
  .put(updateTask)       // both admin & member, controller handles role diff
  .delete(adminOnly, deleteTask);

module.exports = router;
