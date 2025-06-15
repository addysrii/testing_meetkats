const recommendationSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  relationship: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  skills: [String],
  status: {
    type: String,
    enum: ['pending', 'approved', 'declined', 'hidden'],
    default: 'pending'
  },
  featured: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});
const Recommendation = mongoose.model('Recommendation', recommendationSchema);
export default Recommendation