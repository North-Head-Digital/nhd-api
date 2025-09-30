const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: [true, 'Message subject is required'],
    trim: true,
    maxlength: [200, 'Subject cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Message content is required'],
    trim: true
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Client ID is required']
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Sender ID is required']
  },
  senderName: {
    type: String,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  category: {
    type: String,
    enum: ['project-update', 'question', 'feedback', 'urgent', 'general'],
    default: 'general'
  },
  attachments: [{
    name: String,
    url: String,
    size: Number,
    type: String
  }],
  replies: [{
    content: String,
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    senderName: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Index for efficient client-based queries
messageSchema.index({ clientId: 1, createdAt: -1 });
messageSchema.index({ clientId: 1, isRead: 1 });

module.exports = mongoose.model('Message', messageSchema);
