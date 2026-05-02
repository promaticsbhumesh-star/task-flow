const Project = require('../models/Project');
const User = require('../models/User');
const Task = require('../models/Task');

// ─── POST /api/projects  (admin only) ────────────────────────────────────────
const createProject = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Project name is required' });

    const project = await Project.create({
      name,
      description,
      createdBy: req.user._id,
      members: [req.user._id], // creator is automatically a member
    });

    await project.populate('createdBy', 'name email');
    res.status(201).json({ success: true, project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET /api/projects ───────────────────────────────────────────────────────
// Admin sees all; member sees only their projects
const getProjects = async (req, res) => {
  try {
    let query = {};
    if (req.user.role !== 'admin') {
      query = { members: req.user._id };
    }

    const projects = await Project.find(query)
      .populate('createdBy', 'name email')
      .populate('members', 'name email role')
      .sort({ createdAt: -1 });

    res.json({ success: true, projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET /api/projects/:id ───────────────────────────────────────────────────
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('members', 'name email role');

    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    // Members can only view their own projects
    if (
      req.user.role !== 'admin' &&
      !project.members.some((m) => m._id.toString() === req.user._id.toString())
    ) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── PUT /api/projects/:id  (admin only) ────────────────────────────────────
const updateProject = async (req, res) => {
  try {
    const { name, description, status } = req.body;
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { name, description, status },
      { new: true, runValidators: true }
    ).populate('createdBy members', 'name email role');

    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    res.json({ success: true, project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── DELETE /api/projects/:id  (admin only) ──────────────────────────────────
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    // Delete all tasks belonging to this project
    await Task.deleteMany({ project: req.params.id });

    res.json({ success: true, message: 'Project and its tasks deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── POST /api/projects/:id/members  (admin only) ───────────────────────────
const addMember = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    if (project.members.includes(userId)) {
      return res.status(400).json({ success: false, message: 'User already a member' });
    }

    project.members.push(userId);
    await project.save();
    await project.populate('members', 'name email role');

    res.json({ success: true, message: 'Member added', project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── DELETE /api/projects/:id/members/:userId  (admin only) ─────────────────
const removeMember = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    project.members = project.members.filter(
      (m) => m.toString() !== req.params.userId
    );
    await project.save();
    await project.populate('members', 'name email role');

    res.json({ success: true, message: 'Member removed', project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
};
