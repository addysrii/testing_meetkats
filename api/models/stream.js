const streamSchema = new mongoose.Schema({
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  streamKey: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'live', 'ended'],
    default: 'scheduled'
  },
  scheduledFor: Date,
  startedAt: Date,
  endedAt: Date,
  viewers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: Date,
    leftAt: Date
  }],
  maxConcurrentViewers: {
    type: Number,
    default: 0
  },
  totalViews: {
    type: Number,
    default: 0
  },
  privacy: {
    type: String,
    enum: ['public', 'connections', 'private'],
    default: 'public'
  },
  tags: [String],
  chat: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  reactions: [{
    type: {
      type: String,
      enum: ['like', 'love', 'wow', 'laugh', 'sad', 'angry']
    },
    count: {
      type: Number,
      default: 0
    }
  }],
  recordingUrl: String,
  thumbnailUrl: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Live streaming model
const Stream = mongoose.model('Stream', streamSchema);
export default Stream