const streakSchema = new mongoose.Schema({
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
  target: {
    type: String,
    enum: ['daily', 'weekly', 'custom'],
    default: 'daily'
  },
  customFrequency: {
    daysPerWeek: Number,
    specificDays: [Number] // 0-6, where 0 is Sunday
  },
  activity: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  currentStreak: {
    type: Number,
    default: 0
  },
  longestStreak: {
    type: Number,
    default: 0
  },
  totalCompletions: {
    type: Number,
    default: 0
  },
  checkIns: [{
    date: Date,
    completed: Boolean,
    notes: String,
    evidence: String // URL to photo/video evidence
  }],
  reminderTime: Date,
  visibility: {
    type: String,
    enum: ['public', 'connections', 'private'],
    default: 'public'
  },
  supporters: [{
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

const Streak = mongoose.model('Streak', streakSchema);
export default Streak