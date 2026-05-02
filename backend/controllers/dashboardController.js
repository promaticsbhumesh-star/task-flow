const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');

// ─── GET /api/dashboard ──────────────────────────────────────────────────────
const getDashboard = async (req, res) => {
  try {
    const now = new Date();
    let taskFilter = {};

    if (req.user.role !== 'admin') {
      taskFilter.assignedTo = req.user._id;
    }

    // Run all queries in parallel for speed
    const [
      totalTasks,
      completedTasks,
      pendingTasks,
      inProgressTasks,
      overdueTasks,
      totalProjects,
      recentTasks,
    ] = await Promise.all([
      Task.countDocuments(taskFilter),
      Task.countDocuments({ ...taskFilter, status: 'done' }),
      Task.countDocuments({ ...taskFilter, status: 'pending' }),
      Task.countDocuments({ ...taskFilter, status: 'in-progress' }),
      Task.countDocuments({
        ...taskFilter,
        status: { $ne: 'done' },
        dueDate: { $lt: now },
        dueDate: { $ne: null },
      }),
      req.user.role === 'admin'
        ? Project.countDocuments()
        : Project.countDocuments({ members: req.user._id }),
      Task.find(taskFilter)
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('project', 'name')
        .populate('assignedTo', 'name'),
    ]);

    // Admin extras
    let totalUsers = null;
    if (req.user.role === 'admin') {
      totalUsers = await User.countDocuments();
    }

    res.json({
      success: true,
      stats: {
        totalTasks,
        completedTasks,
        pendingTasks,
        inProgressTasks,
        overdueTasks,
        totalProjects,
        totalUsers,
      },
      recentTasks,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getDashboard };
