const achievementSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  category: String,
  dateAchieved: {
    type: Date,
    required: true
  },
  issuer: String,
  certificateUrl: String,
  verificationUrl: String,
  expirationDate: Date,
  image: String,
  visibility: {
    type: String,
    enum: ['public', 'connections', 'private'],
    default: 'public'
  },
  featured: {
    type: Boolean,
    default: false
  },
  endorsements: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    date: {
      type: Date,
      default: Date.now
    }
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


const Achievement = mongoose.model('Achievement', achievementSchema);
export default Achievement