const Task = require('../models/Task');
const Project = require('../models/Project');

// ─── POST /api/tasks  (admin only) ───────────────────────────────────────────
const createTask = async (req, res) => {
  try {
    const { title, description, projectId, assignedTo, dueDate, priority } = req.body;

    if (!title || !projectId) {
      return res.status(400).json({ success: false, message: 'Title and project are required' });
    }

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    // If assigning to someone, make sure they are in the project
    if (assignedTo) {
      const isMember = project.members.some((m) => m.toString() === assignedTo);
      if (!isMember) {
        return res.status(400).json({ success: false, message: 'Assigned user is not a project member' });
      }
    }

    const task = await Task.create({
      title,
      description,
      project: projectId,
      assignedTo: assignedTo || null,
      createdBy: req.user._id,
      dueDate: dueDate || null,
      priority: priority || 'medium',
    });

    await task.populate([
      { path: 'project', select: 'name' },
      { path: 'assignedTo', select: 'name email' },
      { path: 'createdBy', select: 'name email' },
    ]);

    res.status(201).json({ success: true, task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET /api/tasks ──────────────────────────────────────────────────────────
// Admin: all tasks; Member: only tasks assigned to them
const getTasks = async (req, res) => {
  try {
    const { projectId, status } = req.query;
    let filter = {};

    if (req.user.role !== 'admin') {
      filter.assignedTo = req.user._id;
    }
    if (projectId) filter.project = projectId;
    if (status)    filter.status = status;

    const tasks = await Task.find(filter)
      .populate('project', 'name')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET /api/tasks/:id ──────────────────────────────────────────────────────
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('project', 'name')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    // Members can only see their own tasks
    if (
      req.user.role !== 'admin' &&
      task.assignedTo?._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── PUT /api/tasks/:id ──────────────────────────────────────────────────────
// Admin: can update everything; Member: can only update status
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    if (req.user.role === 'admin') {
      // Admin can update all fields
      const { title, description, assignedTo, dueDate, priority, status } = req.body;
      if (title)       task.title = title;
      if (description !== undefined) task.description = description;
      if (assignedTo !== undefined)  task.assignedTo = assignedTo || null;
      if (dueDate !== undefined)     task.dueDate = dueDate || null;
      if (priority)    task.priority = priority;
      if (status)      task.status = status;
    } else {
      // Member: status update only
      const { status } = req.body;

      // Verify this task is assigned to the requesting user
      if (task.assignedTo?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'You can only update your own tasks' });
      }

      const allowed = ['pending', 'in-progress', 'done'];
      if (!allowed.includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status value' });
      }
      task.status = status;
    }

    await task.save();
    await task.populate([
      { path: 'project', select: 'name' },
      { path: 'assignedTo', select: 'name email' },
      { path: 'createdBy', select: 'name email' },
    ]);

    res.json({ success: true, task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── DELETE /api/tasks/:id  (admin only) ─────────────────────────────────────
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createTask, getTasks, getTaskById, updateTask, deleteTask };
