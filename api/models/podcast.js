const podcastSchema = new mongoose.Schema({
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  coverImage: String,
  category: {
    type: String,
    required: true
  },
  tags: [String],
  episodes: [{
    title: String,
    description: String,
    audioUrl: String,
    duration: Number, // in seconds
    releaseDate: Date,
    guests: [{
      name: String,
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }]
  }],
  subscribers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});
const Podcast = mongoose.model('Podcast', podcastSchema);
export default Podcast;