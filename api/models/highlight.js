const highlightSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  stories: [{
    content: String,
    mediaUrl: String,
    mediaType: {
      type: String,
      enum: ['image', 'video']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Highlight = mongoose.model('Highlight', highlightSchema);
export default Highlight;