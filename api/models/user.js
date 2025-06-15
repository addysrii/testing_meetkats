const userSchema = new mongoose.Schema({
  email: { 
    type: String, 
    unique: true,
    sparse: true, // Allow null for phone-only users
    lowercase: true,
    trim: true
  },
  password: { 
    type: String,
    required: function() {
      return this.authProvider === 'local';
    }
  },
  phoneNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  phoneVerified: {
    type: Boolean,
    default: false
  },
  googleId: String,
  linkedinId: String,
  authProvider: {
    type: String,
    enum: ['local', 'google', 'linkedin', 'phone'],
    default: 'local'
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  profilePicture: String,
  headline: String,
  industry: String,
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true,
      default: [0, 0]
    },
    address: String,
    lastUpdated: Date
  },
  connections: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  pendingConnections: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  skills: [{
    name: String,
    endorsements: Number
  }],
  online: {
    type: Boolean,
    default: false
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  deviceTokens: [String],

  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  blockedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  restrictedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  mutedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  privacy: {
    profileVisibility: {
      type: String,
      enum: ['public', 'connections', 'followers', 'private'],
      default: 'public'
    },
    storyVisibility: {
      type: String,
      enum: ['public', 'connections', 'followers', 'close-friends'],
      default: 'followers'
    },
    messagePermission: {
      type: String,
      enum: ['everyone', 'followers', 'connections', 'nobody'],
      default: 'everyone'
    },
    activityStatus: {
      type: String,
      enum: ['everyone', 'followers', 'connections', 'nobody'],
      default: 'everyone'
    },
    searchability: {
      type: Boolean,
      default: true
    }
  },

  portfolio: {
    bio: String,
    headline: String,
    about: String,
    workExperience: [{
      company: String,
      position: String,
      description: String,
      startDate: Date,
      endDate: Date,
      current: Boolean,
      companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company'
      }
    }],
    education: [{
      institution: String,
      degree: String,
      field: String,
      startDate: Date,
      endDate: Date,
      current: Boolean
    }],
    languages: [{
      name: String,
      proficiency: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced', 'native']
      }
    }],
    certifications: [{
      name: String,
      issuer: String,
      issueDate: Date,
      expirationDate: Date,
      credentialId: String,
      url: String
    }],
    interests: [String]
  },

  security: {
    twoFactorEnabled: {
      type: Boolean,
      default: false
    },
    twoFactorMethod: {
      type: String,
      enum: ['app', 'sms', 'email'],
      default: 'sms'
    },
    twoFactorSecret: String,
    twoFactorBackupCodes: [String],
    lastPasswordChange: Date,
    passwordResetTokens: [{
      token: String,
      expiresAt: Date
    }],
    loginHistory: [{
      date: Date,
      ipAddress: String,
      device: String,
      location: String
    }],
    activeLoginSessions: [{
      token: String,
      device: String,
      lastActive: Date,
      expiresAt: Date
    }]
  },

  verification: {
    isVerified: {
      type: Boolean,
      default: false
    },
    verificationDate: Date,
    verificationEvidence: [String]
  },

  analytics: {
    profileViews: {
      count: {
        type: Number,
        default: 0
      },
      lastReset: {
        type: Date,
        default: Date.now
      },
      history: [{
        date: Date,
        count: Number
      }]
    },
    contentEngagement: {
      likes: {
        type: Number,
        default: 0
      },
      comments: {
        type: Number,
        default: 0
      },
      shares: {
        type: Number,
        default: 0
      }
    }
  },

  notificationPreferences: {
    email: {
      messages: {
        type: Boolean,
        default: true
      },
      connections: {
        type: Boolean,
        default: true
      },
      mentions: {
        type: Boolean,
        default: true
      },
      events: {
        type: Boolean,
        default: true
      },
      jobs: {
        type: Boolean,
        default: true
      },
      marketing: {
        type: Boolean,
        default: false
      }
    },
    push: {
      messages: {
        type: Boolean,
        default: true
      },
      connections: {
        type: Boolean,
        default: true
      },
      mentions: {
        type: Boolean,
        default: true
      },
      events: {
        type: Boolean,
        default: true
      },
      jobs: {
        type: Boolean,
        default: true
      }
    },
    inApp: {
      messages: {
        type: Boolean,
        default: true
      },
      connections: {
        type: Boolean,
        default: true
      },
      mentions: {
        type: Boolean,
        default: true
      },
      events: { 
        type: Boolean,
        default: true
      },
      jobs: {
        type: Boolean,
        default: true
      }
    }
  }
}, { timestamps: true }); // Enables createdAt and updatedAt fields
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Password validation method
userSchema.methods.validatePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

// Add indexes
userSchema.index({ location: '2dsphere' });
userSchema.index({ email: 1 });
userSchema.index({ phoneNumber: 1 });
userSchema.index({ skills: 1 });
userSchema.index({ industry: 1 });
userSchema.index({ 'portfolio.workExperience.company': 1 });
userSchema.index({ 'portfolio.education.institution': 1 });
module.exports = mongoose.model('User', userSchema);