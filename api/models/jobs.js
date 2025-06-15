const jobSchema = new mongoose.Schema({
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  company: {
    name: String,
    logo: String,
    website: String,
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company'
    }
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  jobType: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'internship', 'remote'],
    required: true
  },
  location: {
    city: String,
    country: String,
    remote: Boolean
  },
  salary: {
    min: Number,
    max: Number,
    currency: String,
    period: {
      type: String,
      enum: ['hourly', 'monthly', 'yearly']
    },
    isVisible: {
      type: Boolean,
      default: true
    }
  },
  requirements: [String],
  responsibilities: [String],
  skills: [String],
  experienceLevel: {
    type: String,
    enum: ['entry', 'mid', 'senior', 'lead', 'executive'],
    required: true
  },
  industry: String,
  applicationDeadline: Date,
  applicationLink: String,
  applicants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['applied', 'reviewing', 'interviewed', 'offered', 'hired', 'rejected'],
      default: 'applied'
    },
    appliedAt: {
      type: Date,
      default: Date.now
    }
  }],
  active: {
    type: Boolean,
    default: true
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

const Job = mongoose.model('Job', jobSchema);
export default Job;