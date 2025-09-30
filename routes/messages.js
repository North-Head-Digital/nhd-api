const express = require('express');
const Message = require('../models/Message');
const auth = require('../middleware/auth');

const router = express.Router();

// Get messages for a specific client or all messages for admin
router.get('/', auth, async (req, res) => {
  try {
    const currentUser = await require('../models/User').findById(req.user.userId);
    
    let query = {};
    let populateFields = ['clientId', 'senderId'];
    
    if (currentUser.role === 'admin') {
      // Admin sees all messages from all clients
      query = {};
    } else {
      // Clients only see their own messages
      query = { clientId: req.user.userId };
    }
    
    const messages = await Message.find(query)
      .populate('clientId', 'name email company')
      .populate('senderId', 'name email')
      .sort({ createdAt: -1 });

    res.json({ messages });

  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ 
      error: 'Failed to get messages',
      message: error.message 
    });
  }
});

// Get a specific message
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = await require('../models/User').findById(req.user.userId);
    
    const message = await Message.findById(id)
      .populate('clientId', 'name email company')
      .populate('senderId', 'name email');
    
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Check if user has access to this message
    if (currentUser.role !== 'admin' && message.clientId._id.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Mark as read if it's the client viewing their own message
    if (currentUser.role !== 'admin' && !message.isRead) {
      message.isRead = true;
      await message.save();
    }

    res.json({ message });

  } catch (error) {
    console.error('Get message error:', error);
    res.status(500).json({ 
      error: 'Failed to get message',
      message: error.message 
    });
  }
});

// Create a new message
router.post('/', auth, async (req, res) => {
  try {
    const currentUser = await require('../models/User').findById(req.user.userId);
    
    const message = new Message({
      ...req.body,
      senderId: req.user.userId,
      senderName: currentUser.name,
      clientId: req.body.clientId || req.user.userId
    });

    await message.save();
    await message.populate('clientId', 'name email company');
    await message.populate('senderId', 'name email');

    res.status(201).json({
      message: 'Message created successfully',
      message: message
    });

  } catch (error) {
    console.error('Create message error:', error);
    res.status(500).json({ 
      error: 'Failed to create message',
      message: error.message 
    });
  }
});

// Reply to a message
router.post('/:id/reply', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = await require('../models/User').findById(req.user.userId);
    
    const message = await Message.findById(id);
    
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Check if user has access to this message
    if (currentUser.role !== 'admin' && message.clientId.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    message.replies.push({
      content: req.body.content,
      senderId: req.user.userId,
      senderName: currentUser.name
    });

    await message.save();
    await message.populate('clientId', 'name email company');
    await message.populate('senderId', 'name email');

    res.json({
      message: 'Reply added successfully',
      message: message
    });

  } catch (error) {
    console.error('Reply to message error:', error);
    res.status(500).json({ 
      error: 'Failed to reply to message',
      message: error.message 
    });
  }
});

// Mark message as read
router.put('/:id/read', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = await require('../models/User').findById(req.user.userId);
    
    const message = await Message.findById(id);
    
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Check if user has access to this message
    if (currentUser.role !== 'admin' && message.clientId.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    message.isRead = true;
    await message.save();

    res.json({
      message: 'Message marked as read'
    });

  } catch (error) {
    console.error('Mark message as read error:', error);
    res.status(500).json({ 
      error: 'Failed to mark message as read',
      message: error.message 
    });
  }
});

module.exports = router;
