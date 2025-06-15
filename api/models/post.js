const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['text', 'image', 'video', 'link', 'poll', 'article', 'job', 'event'],
    default: 'text'
  },
  images: [{
    url: String,
    caption: String,
    altText: String,
    order: Number
  }],
  videos: [{
    url: String,
    thumbnail: String,
    caption: String,
    duration: Number
  }],
  visibility: {
    type: String,
    enum: ['public', 'connections', 'private'],
    default: 'public'
  },
  linkPreview: {
    url: String,
    title: String,
    description: String,
    imageUrl: String
  },
  location: {
    name: String,
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    }
  },
  mentions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    position: {
      start: Number,
      end: Number
    }
  }],
  hashtags: [String],
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reaction: {
      type: String,
      enum: ['like', 'love', 'celebrate', 'support', 'insightful', 'curious'],
      default: 'like'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  bookmarks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true
    },
    mentions: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      position: {
        start: Number,
        end: Number
      }
    }],
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    parentComment: {
      type: mongoose.Schema.Types.ObjectId
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date
    }
  }],
  pollData: {
    question: String,
    options: [{
      text: String,
      votes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }]
    }],
    expiresAt: Date,
    allowMultipleVotes: {
      type: Boolean,
      default: false
    }
  },
  articleData: {
    title: String,
    subtitle: String,
    coverImage: String,
    readTime: Number, // in minutes
    sections: [{
      heading: String,
      content: String,
      mediaUrl: String,
      mediaType: String
    }]
  },
  eventData: {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event'
    },
    title: String,
    startDate: Date,
    endDate: Date,
    location: String,
    coverImage: String
  },
  jobData: {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job'
    },
    title: String,
    company: String,
    location: String,
    description: String
  },
  shareCount: {
    type: Number,
    default: 0
  },
  impressions: {
    type: Number,
    default: 0
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editHistory: [{
    content: String,
    editedAt: Date
  }],
  isPinned: {
    type: Boolean,
    default: false
  },
  lastUpdated: {
    type: Date
  },
  tags: [String],
  createdAt: {
    type: Date,
    default: Date.now
  },
  deletedAt: {
    type: Date
  }
}, {
  timestamps: true
});

postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ tags: 1 })
const Post = mongoose.model('Post', postSchema);
export default Post;