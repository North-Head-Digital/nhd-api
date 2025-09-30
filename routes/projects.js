const express = require('express');
const Project = require('../models/Project');
const auth = require('../middleware/auth');

const router = express.Router();

// Get projects for a specific client
router.get('/', auth, async (req, res) => {
  try {
    const currentUser = await require('../models/User').findById(req.user.userId);
    
    // Clients can only see their own projects
    // Admins can see all projects
    const query = currentUser.role === 'admin' ? {} : { clientId: req.user.userId };
    
    const projects = await Project.find(query)
      .populate('clientId', 'name email company')
      .sort({ createdAt: -1 });

    res.json({ projects });

  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ 
      error: 'Failed to get projects',
      message: error.message 
    });
  }
});

// Get a specific project
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = await require('../models/User').findById(req.user.userId);
    
    const project = await Project.findById(id).populate('clientId', 'name email company');
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if user has access to this project
    if (currentUser.role !== 'admin' && project.clientId._id.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ project });

  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ 
      error: 'Failed to get project',
      message: error.message 
    });
  }
});

// Create a new project (admin only)
router.post('/', auth, async (req, res) => {
  try {
    const currentUser = await require('../models/User').findById(req.user.userId);
    
    if (currentUser.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin role required.' });
    }

    // Validate that clientId is provided
    if (!req.body.clientId) {
      return res.status(400).json({ error: 'Client ID is required to assign project' });
    }

    const project = new Project({
      ...req.body,
      clientId: req.body.clientId
    });

    await project.save();
    await project.populate('clientId', 'name email company');

    res.status(201).json({
      message: 'Project created and assigned successfully',
      project
    });

  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ 
      error: 'Failed to create project',
      message: error.message 
    });
  }
});

// Update a project
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = await require('../models/User').findById(req.user.userId);
    
    const project = await Project.findById(id);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if user has access to this project
    if (currentUser.role !== 'admin' && project.clientId.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // If admin is changing clientId, validate the new client exists
    if (currentUser.role === 'admin' && req.body.clientId && req.body.clientId !== project.clientId.toString()) {
      const newClient = await require('../models/User').findById(req.body.clientId);
      if (!newClient) {
        return res.status(400).json({ error: 'Invalid client ID' });
      }
    }

    const updatedProject = await Project.findByIdAndUpdate(
      id, 
      req.body, 
      { new: true, runValidators: true }
    ).populate('clientId', 'name email company');

    res.json({
      message: 'Project updated successfully',
      project: updatedProject
    });

  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ 
      error: 'Failed to update project',
      message: error.message 
    });
  }
});

// Delete a project (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const currentUser = await require('../models/User').findById(req.user.userId);
    
    if (currentUser.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin role required.' });
    }

    const project = await Project.findByIdAndDelete(req.params.id);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({
      message: 'Project deleted successfully'
    });

  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ 
      error: 'Failed to delete project',
      message: error.message 
    });
  }
});

module.exports = router;
