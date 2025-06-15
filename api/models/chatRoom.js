const chatRoomSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  type: {
    type: String,
    enum: ['direct', 'group'],
    default: 'direct'
  },
  name: String,
  description: String,
  image: String,
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  pinnedMessages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  }],
  muted: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    until: Date
  }],
  callHistory: [{
    initiator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    callType: {
      type: String,
      enum: ['audio', 'video']
    },
    startTime: Date,
    endTime: Date,
    duration: Number, // in seconds
    participants: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      joinedAt: Date,
      leftAt: Date
    }],
    status: {
      type: String,
      enum: ['missed', 'declined', 'completed']
    }
  }],
  polls: [{
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    question: String,
    options: [{
      text: String,
      votes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }]
    }],
    multipleChoice: {
      type: Boolean,
      default: false
    },
    expiresAt: Date,
    closed: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
});
const ChatRoom = mongoose.model('ChatRoom', chatRoomSchema);
export default ChatRoom