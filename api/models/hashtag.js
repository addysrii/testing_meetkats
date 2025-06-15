const hashtagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  postCount: {
    type: Number,
    default: 0
  },
  eventCount: {
    type: Number,
    default: 0
  },
  podcastCount: {
    type: Number,
    default: 0
  },
  jobCount: {
    type: Number,
    default: 0
  },
  followerCount: {
    type: Number,
    default: 0
  },
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  trending: {
    type: Boolean,
    default: false
  },
  category: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Hashtag = mongoose.model('Hashtag', hashtagSchema);
export default Hashtag;