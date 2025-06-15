const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const passport = require('passport');
const http = require('http');
const LocalStrategy = require('passport-local').Strategy;
const { Server } = require('socket.io');
const session = require('express-session');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const axios = require('axios');
const crypto = require('crypto');
const WebSocket = require('ws');
const { networkInterfaces } = require('os');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const twilio = require('twilio');
const { profile } = require('console');


// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL || `https://myapp-uc9m.onrender.com`;
app.use(cors({
  origin: 'http://localhost:5173', // Your frontend URL
  credentials: true
}));
// Environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key';
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const STREAMING_SERVER_URL = process.env.STREAMING_SERVER_URL;
const STREAMING_SECRET = process.env.STREAMING_SECRET;
const PAYMENT_GATEWAY_API_KEY = process.env.PAYMENT_GATEWAY_API_KEY;
const PAYMENT_GATEWAY_SECRET = process.env.PAYMENT_GATEWAY_SECRET;

// Cloudinary setup
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Auth provider credentials
const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_VERIFY_SERVICE = process.env.TWILIO_VERIFY_SERVICE;
const REDIRECT_URI = `${BASE_URL}/auth/linkedin/callback`;

// Initialize Twilio client
const twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

// Middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

app.use(passport.initialize());
app.use(passport.session());
// app.use(cors({
//   origin: 'http://localhost:5173', // Your frontend URL
//   credentials: true
// }));
app.use(bodyParser.json());

// Cloudinary storage setup for file uploads
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'app_uploads',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'mov', 'avi', 'pdf', 'doc', 'docx']
  }
});

const upload = multer({ storage: storage });
const postStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'posts',
    resource_type: 'auto',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'mov'],
    transformation: [
      { quality: 'auto' }, // Automatic quality optimization
      { fetch_format: 'auto' }  // Automatic format conversion based on browser
    ]
  }
});

const postUpload = multer({
  storage: postStorage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit for videos
    files: 10 // Allow up to 10 files per post
  },
  fileFilter: (req, file, cb) => {
    // Validate file type
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images and videos are allowed.'), false);
    }
  }
});

// JWT Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Passport serialization
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// ========================
// MONGODB SCHEMAS
// ========================

// Original Schemas (Updated)
const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  chatRoom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChatRoom',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'video', 'file', 'poll', 'call', 'location'],
    default: 'text'
  },
  mediaUrl: String,
  fileName: String,
  fileSize: Number,
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  reactions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reaction: String
  }],
  deletedFor: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  updatedAt: Date
});

const chatRoomSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  type: {
    type: String,
    enum: ['direct', 'group'],
    default: 'direct'
  },
  name: String,
  description: String,
  image: String,
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  pinnedMessages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  }],
  muted: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    until: Date
  }],
  callHistory: [{
    initiator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    callType: {
      type: String,
      enum: ['audio', 'video']
    },
    startTime: Date,
    endTime: Date,
    duration: Number, // in seconds
    participants: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      joinedAt: Date,
      leftAt: Date
    }],
    status: {
      type: String,
      enum: ['missed', 'declined', 'completed']
    }
  }],
  polls: [{
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    question: String,
    options: [{
      text: String,
      votes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }]
    }],
    multipleChoice: {
      type: Boolean,
      default: false
    },
    expiresAt: Date,
    closed: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
});

const storySchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  filter: { type: String, default: 'none' },
  textPosition: { type: String, default: 'bottom' },
  content: {
   type: String,
  default: ''
  },
  mediaUrl: {
    type: String,
    required: true
  },
  mediaType: {
    type: String,
    enum: ['image', 'video'],
    required: true
  },
  location: {
    name: String,
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    }
  },
  backgroundStyle: {
    backgroundColor: String,
    textColor: String,
    fontStyle: String
  },
  mentions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    position: {
      x: Number,
      y: Number
    }
  }],
  stickers: [{
    imageUrl: String,
    position: {
      x: Number,
      y: Number
    },
    rotation: Number,
    scale: Number
  }],
  linkUrl: String,
  viewers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    viewedAt: {
      type: Date,
      default: Date.now
    }
  }],
  reactions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reaction: {
      type: String,
      enum: ['heart', 'laugh', 'wow', 'sad', 'angry', 'fire', 'clap', 'question']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  replies: [{
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
  privacy: {
    type: String,
    enum: ['public', 'connections', 'close-friends'],
    default: 'public'
  },
  featured: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400 // 24 hours in seconds
  }
});

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

// Enhanced User Schema
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

module.exports = mongoose.model('User', userSchema);


// Password hashing middleware
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
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ tags: 1 });

// ========================
// NEW SCHEMA DEFINITIONS
// ========================

// DISCOVERY SYSTEM

// Event Schema
const eventSchema = new mongoose.Schema({
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
  eventType: {
    type: String,
    enum: ['in-person', 'virtual', 'hybrid'],
    required: true
  },
  category: {
    type: String,
    required: true
  },
  tags: [String],
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  location: {
    address: String,
    city: String,
    country: String,
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    },
    virtual: {
      platform: String,
      link: String
    }
  },
  coverImage: String,
  attendees: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['going', 'interested', 'not-going'],
      default: 'interested'
    }
  }],
  privacy: {
    type: String,
    enum: ['public', 'private', 'invite-only'],
    default: 'public'
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

// Podcast Schema
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

// Job Posting Schema
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

// Company Schema
const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  logo: String,
  coverImage: String,
  website: String,
  industry: String,
  size: {
    type: String,
    enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1001-5000', '5000+']
  },
  founded: Number,
  headquarters: {
    city: String,
    country: String
  },
  locations: [{
    city: String,
    country: String
  }],
  admins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  employees: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    position: String,
    verified: {
      type: Boolean,
      default: false
    }
  }],
  followers: [{
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

// PORTFOLIO SYSTEM

// Project Schema
const projectSchema = new mongoose.Schema({
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
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Bookmark Schema
const bookmarkSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  collections: [{
    name: {
      type: String,
      required: true
    },
    description: String,
    privacy: {
      type: String,
      enum: ['private', 'public'],
      default: 'private'
    },
    items: [{
      contentType: {
        type: String,
        enum: ['post', 'event', 'podcast', 'job', 'project'],
        required: true
      },
      contentId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'collections.items.contentType',
        required: true
      },
      savedAt: {
        type: Date,
        default: Date.now
      },
      notes: String
    }]
  }]
});

// Report Schema
const reportSchema = new mongoose.Schema({
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contentType: {
    type: String,
    enum: ['post', 'comment', 'message', 'user', 'event', 'podcast', 'job'],
    required: true
  },
  contentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  reason: {
    type: String,
    enum: ['spam', 'harassment', 'inappropriate', 'violence', 'intellectual-property', 'fraud', 'other'],
    required: true
  },
  description: String,
  status: {
    type: String,
    enum: ['pending', 'under-review', 'resolved', 'dismissed'],
    default: 'pending'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolution: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// SOCIAL FEATURES

// Mention Schema
const mentionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mentionedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contentType: {
    type: String,
    enum: ['post', 'comment', 'message', 'event', 'project'],
    required: true
  },
  contentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'contentType'
  },
  read: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Recommendation Schema
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

// Notification Schema

// Streak Schema
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

// Achievement Schema
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

// AUXILIARY SYSTEMS

// Hashtag Schema
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
// Notification Schema (continued)
const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    enum: [
      'message', 'connection_request', 'connection_accepted', 
      'mention', 'like', 'comment', 'follow', 'event_invite',
      'project_collaboration', 'job_recommendation', 'endorsement',
      'recommendation', 'streak_support', 'achievement',
      'event_rsvp', 'event_interest', 'new_episode', 'podcast_subscription',
      'job_application', 'stream_scheduled', 'stream_started', 'new_subscriber'
    ],
    required: true
  },
  contentType: {
    type: String,
    enum: ['post', 'comment', 'message', 'user', 'event', 'podcast', 'job', 'project', 'streak', 'achievement', 'subscription', 'stream', 'recommendation'],
    required: true
  },
  contentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  actionUrl: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// LIVESTREAMING SYSTEM

// Stream Schema
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

// MONETIZATION SYSTEM

// Creator Program Schema
const creatorProgramSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  paymentInfo: {
    paypalEmail: String,
    bankAccount: {
      accountName: String,
      accountNumber: String,
      routingNumber: String,
      bankName: String
    }
  },
  taxInfo: {
    country: String,
    taxId: String,
    businessName: String,
    businessType: String
  },
  earnings: {
    total: {
      type: Number,
      default: 0
    },
    available: {
      type: Number,
      default: 0
    },
    pending: {
      type: Number,
      default: 0
    },
    history: [{
      amount: Number,
      source: {
        type: String,
        enum: ['subscription', 'donation', 'content_sale']
      },
      sourceId: mongoose.Schema.Types.ObjectId,
      status: {
        type: String,
        enum: ['pending', 'completed', 'failed']
      },
      date: {
        type: Date,
        default: Date.now
      }
    }]
  },
  subscriptionTiers: [{
    name: String,
    price: Number,
    interval: {
      type: String,
      enum: ['monthly', 'yearly']
    },
    benefits: [String],
    subscribers: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      startDate: Date,
      renewalDate: Date,
      status: {
        type: String,
        enum: ['active', 'cancelled', 'expired']
      }
    }]
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

// ========================
// MONGOOSE MODELS
// ========================

// Original models
const Message = mongoose.model('Message', messageSchema);
const ChatRoom = mongoose.model('ChatRoom', chatRoomSchema);
const User = mongoose.model('User', userSchema);
const Post = mongoose.model('Post', postSchema);
const Story = mongoose.model('Story', storySchema);
const Highlight = mongoose.model('Highlight', highlightSchema);

// New discovery system models
const Event = mongoose.model('Event', eventSchema);
const Podcast = mongoose.model('Podcast', podcastSchema);
const Job = mongoose.model('Job', jobSchema);
const Company = mongoose.model('Company', companySchema);

// Portfolio system models
const Project = mongoose.model('Project', projectSchema);
const Streak = mongoose.model('Streak', streakSchema);
const Achievement = mongoose.model('Achievement', achievementSchema);

// Auxiliary system models
const Hashtag = mongoose.model('Hashtag', hashtagSchema);
const Bookmark = mongoose.model('Bookmark', bookmarkSchema);
const Report = mongoose.model('Report', reportSchema);

// Social feature models
const Mention = mongoose.model('Mention', mentionSchema);
const Recommendation = mongoose.model('Recommendation', recommendationSchema);
const Notification = mongoose.model('Notification', notificationSchema);

// Live streaming model
const Stream = mongoose.model('Stream', streamSchema);

// Monetization model
const CreatorProgram = mongoose.model('CreatorProgram', creatorProgramSchema);

// ========================
// PASSPORT STRATEGIES
// ========================

// LinkedIn Strategy
passport.use(new LinkedInStrategy({
  clientID: LINKEDIN_CLIENT_ID,
  clientSecret: LINKEDIN_CLIENT_SECRET,
  callbackURL: `${BASE_URL}/auth/linkedin/callback`,
  scope: ['profile', 'email'],
  state: true
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ linkedinId: profile.id });

    if (!user) {
      user = await User.create({
        linkedinId: profile.id,
        email: profile.emails[0].value,
        firstName: profile.name.givenName,
        lastName: profile.name.familyName,
        profilePicture: profile.photos[0]?.value,
        authProvider: 'linkedin'
      });
    }

    return done(null, user);
  } catch (error) {
    console.error("Error in LinkedIn authentication:", error);
    return done(error, null);
  }
}));

// Google Strategy
// Improved Google Strategy with explicit isNewUser flag
passport.use(new GoogleStrategy({
  clientID: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  callbackURL: `${BASE_URL}/auth/google/callback`,
  scope: ['profile', 'email']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    if (!profile.id) {
      return done(null, false, { message: 'Google authentication failed' });
    }

    const email = profile.emails?.[0]?.value || null;

    // Check if user already exists
    let user = await User.findOne({ $or: [{ googleId: profile.id }, { email }] }).lean();

    // Flag to track if this is a truly new user
    let isNewUser = false;

    if (!user) {
      // Create new user
      user = await User.create({
        googleId: profile.id,
        email,
        firstName: profile.name?.givenName || '',
        lastName: profile.name?.familyName || '',
        profilePicture: profile.photos?.[0]?.value || null,
        authProvider: 'google',
        createdAt: new Date(),
      });

      // Explicitly mark as new user
      isNewUser = true;
      console.log('New user created:', user._id);
    } else if (!user.googleId) {
      // Link Google ID to an existing email-based user
      await User.findByIdAndUpdate(user._id, { googleId: profile.id }, { new: true });
      console.log('Linked Google account to existing user:', user._id);
    }

    // Attach isNewUser flag to the user object
    user.isNewUser = isNewUser;

    return done(null, user);
  } catch (error) {
    console.error('Error in Google authentication:', error);
    return done(error, null);
  }
}));

// ========================
// HELPER FUNCTIONS
// ========================

// Create notification
async function createNotification(data) {
  try {
    return await Notification.create(data);
  } catch (error) {
    console.error('Create notification error:', error);
    return null;
  }
}

// Update hashtags
async function updateHashtags(tags, contentType, oldTags = []) {
  try {
    // Convert tags to lowercase
    const lowerTags = tags.map(tag => tag.toLowerCase());
    const lowerOldTags = oldTags.map(tag => tag.toLowerCase());
    
    // Find new tags
    const newTags = lowerTags.filter(tag => !lowerOldTags.includes(tag));
    
    // Find removed tags
    const removedTags = lowerOldTags.filter(tag => !lowerTags.includes(tag));
    
    // Update hashtag counts for new tags
    for (const tag of newTags) {
      const updateFields = {};
      
      switch (contentType) {
        case 'event':
          updateFields.eventCount = 1;
          break;
        case 'podcast':
          updateFields.podcastCount = 1;
          break;
        case 'job':
          updateFields.jobCount = 1;
          break;
        default:
          updateFields.postCount = 1;
      }
      
      await Hashtag.findOneAndUpdate(
        { name: tag },
        { 
          $inc: updateFields,
          $setOnInsert: { name: tag }
        },
        { upsert: true, new: true }
      );
    }
    
    // Update hashtag counts for removed tags
    for (const tag of removedTags) {
      const updateFields = {};
      
      switch (contentType) {
        case 'event':
          updateFields.eventCount = -1;
          break;
        case 'podcast':
          updateFields.podcastCount = -1;
          break;
        case 'job':
          updateFields.jobCount = -1;
          break;
        default:
          updateFields.postCount = -1;
      }
      
      await Hashtag.findOneAndUpdate(
        { name: tag },
        { $inc: updateFields }
      );
    }
    
    // Update trending status
    await updateTrendingHashtags();
    
    return true;
  } catch (error) {
    console.error('Update hashtags error:', error);
    return false;
  }
}

// Update trending hashtags
async function updateTrendingHashtags() {
  try {
    // Get all hashtags
    const hashtags = await Hashtag.find({});
    
    // Update trending status based on total counts
    const sortedHashtags = hashtags.sort((a, b) => {
      const totalA = a.postCount + a.eventCount + a.podcastCount + a.jobCount;
      const totalB = b.postCount + b.eventCount + b.podcastCount + b.jobCount;
      return totalB - totalA;
    });
    
    const trending = sortedHashtags.slice(0, 20).map(h => h._id);
    
    // Update trending status
    await Hashtag.updateMany(
      { _id: { $in: trending } },
      { trending: true }
    );
    
    await Hashtag.updateMany(
      { _id: { $nin: trending } },
      { trending: false }
    );
    
    return true;
  } catch (error) {
    console.error('Update trending hashtags error:', error);
    return false;
  }
}

// Check if two users are connected
async function areConnected(userId1, userId2) {
  try {
    const user = await User.findById(userId1);
    return user && user.connections.includes(userId2);
  } catch (error) {
    console.error('Check connection error:', error);
    return false;
  }
}

// Check if same day for streaks
function isSameDay(date1, date2) {
  return date1.toISOString().split('T')[0] === date2.toISOString().split('T')[0];
}

// Get day difference
function getDayDifference(date1, date2) {
  const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
  const diffDays = Math.round(Math.abs((date1 - date2) / oneDay));
  return diffDays;
}

// Check if valid streak day
function isValidStreakDay(dayDiff, target, customFrequency) {
  switch (target) {
    case 'daily':
      return dayDiff === 1;
    case 'weekly':
      return dayDiff <= 7;
    case 'custom':
      // For custom frequency, check if days per week matches
      if (customFrequency && customFrequency.daysPerWeek) {
        return dayDiff <= (7 / customFrequency.daysPerWeek);
      }
      return false;
    default:
      return false;
  }
}

// Helper for session management
function updateUserSession(user, token, device) {
  // Create new session
  const session = {
    token,
    device,
    lastActive: new Date(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days expiration
  };
  
  // Initialize if doesn't exist
  if (!user.security) {
    user.security = {};
  }
  
  if (!user.security.activeLoginSessions) {
    user.security.activeLoginSessions = [];
  }
  
  // Add session
  user.security.activeLoginSessions.push(session);
}

// Update user and return token
async function updateUserAndReturnToken(user, deviceToken, res) {
  // Update device token if provided
  if (deviceToken && !user.deviceTokens.includes(deviceToken)) {
    user.deviceTokens.push(deviceToken);
  }
  
  // Update last active time
  user.lastActive = new Date();
  
  // Generate JWT token
  const token = jwt.sign(
    { id: user._id, email: user.email },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
  
  // Add to active sessions
  updateUserSession(user, token, deviceToken ? 'mobile' : 'web');
  
  // Add login history
  if (!user.security) {
    user.security = {};
  }
  
  if (!user.security.loginHistory) {
    user.security.loginHistory = [];
  }
  
  user.security.loginHistory.push({
    date: new Date(),
    ipAddress: 'unknown', // In a real app, get from request
    device: deviceToken ? 'mobile' : 'web',
    location: 'unknown' // In a real app, could use GeoIP
  });
  
  await user.save();

  // Prepare user object for response (remove sensitive data)
  const userResponse = user.toObject();
  delete userResponse.password;
  delete userResponse.deviceTokens;
  delete userResponse.security.twoFactorSecret;
  delete userResponse.security.twoFactorBackupCodes;


// Send the response with isNewUser flag
res.json({
  token,
  user: userResponse,
});
  // Send the response
 
}

// Calculate distance using Google Maps API
async function calculateDistance(lat1, lon1, lat2, lon2) {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${lat1},${lon1}&destinations=${lat2},${lon2}&key=${GOOGLE_MAPS_API_KEY}`
    );

    return response.data.rows[0].elements[0].distance;
  } catch (error) {
    console.error('Distance calculation error:', error);
    return null;
  }
}
const storyStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'stories',
    resource_type: 'auto',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'mov'],
    transformation: [
      { quality: 'auto:good' }, // Automatic quality optimization
      { fetch_format: 'auto' }  // Automatic format conversion based on browser
    ]
  }
});

// Setup upload middleware with file size limits
const storyUpload = multer({
  storage: storyStorage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit for video stories
    files: 1
  },
  fileFilter: (req, file, cb) => {
    // Validate file type
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images and videos are allowed.'), false);
    }
  }
});
// ========================
// API ROUTES
// ========================

// ----------------------
// AUTHENTICATION ROUTES
// ----------------------

app.post('/auth/signup', async (req, res) => {
  try {
    const { email, password, firstName, lastName, deviceToken } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const user = await User.create({
      email: email.toLowerCase(),
      password,
      firstName,
      lastName,
      deviceTokens: deviceToken ? [deviceToken] : [],
      authProvider: 'local'
    });
    
    // Update user and return token
    await updateUserAndReturnToken(user, deviceToken, res);
    
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Error creating user' });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { email, password, phoneNumber, code, deviceToken, authProvider } = req.body;

    // Determine authentication method
    if (authProvider === 'phone' && phoneNumber) {
      // Phone authentication
      if (!code) {
        return res.status(400).json({ error: 'Verification code is required for phone login' });
      }

      // Verify the code with Twilio
      const verification = await twilioClient.verify.v2.services(TWILIO_VERIFY_SERVICE)
        .verificationChecks
        .create({ to: phoneNumber, code });

      if (!verification.valid) {
        return res.status(400).json({ error: 'Invalid verification code' });
      }

      // Find user by phone number
      const user = await User.findOne({ phoneNumber, authProvider: 'phone' });
      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }

      // Update user and return token
      await updateUserAndReturnToken(user, deviceToken, res);
    } 
    else if ((authProvider === 'google' || authProvider === 'linkedin') && email) {
      // For social logins, we need to redirect to their respective auth routes
      return res.status(400).json({ 
        error: 'For Google or LinkedIn authentication, please use the dedicated auth endpoints',
        redirectUrl: authProvider === 'google' ? '/auth/google' : '/auth/linkedin'
      });
    }
    else if (email && password) {
      // Traditional email/password login
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Check if this user has a password (local auth provider)
      if (!user.password) {
        // Suggest the correct auth method
        return res.status(400).json({ 
          error: `This account uses ${user.authProvider} authentication. Please login with that method.`,
          authProvider: user.authProvider
        });
      }

      const isValid = await user.validatePassword(password);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Update user and return token
      await updateUserAndReturnToken(user, deviceToken, res);
    } 
    else {
      return res.status(400).json({ error: 'Invalid login credentials provided' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Error logging in' });
  }
});

// LinkedIn routes
// Add this environment variable to your .env file
// FRONTEND_URL=http://localhost:3000 (or your actual frontend URL)

// LinkedIn routes - updated
app.get('/auth/linkedin', (req, res) => {
  // Store the intended redirect destination if provided
  const redirectTo = req.query.redirectTo || '/dashboard';
  // Store it in the session for use after authentication
  req.session.redirectTo = redirectTo;
  
  const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${LINKEDIN_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=openid%20profile%20email`;
  res.redirect(authUrl);
});

app.get('/auth/linkedin/callback', async (req, res) => {
  const authorizationCode = req.query.code;

  if (!authorizationCode) {
    return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
  }

  try {
    // Create form data properly
    const formData = new URLSearchParams();
    formData.append('grant_type', 'authorization_code');
    formData.append('code', authorizationCode);
    formData.append('redirect_uri', REDIRECT_URI);
    formData.append('client_id', LINKEDIN_CLIENT_ID);
    formData.append('client_secret', LINKEDIN_CLIENT_SECRET);

    const response = await axios.post(
      'https://www.linkedin.com/oauth/v2/accessToken',
      formData.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const { access_token } = response.data;
    
    // Get user profile data with the access token
    const profileResponse = await axios.get('https://api.linkedin.com/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'cache-control': 'no-cache',
      },
    });
    
    const linkedinId = profileResponse.data.id;
    const email = profileResponse.data.email;
    let firstName = profileResponse.data.localizedFirstName || profileResponse.data.firstName || profileResponse.data.given_name || 'Unknown';
    let lastName = profileResponse.data.localizedLastName || profileResponse.data.lastName || profileResponse.data.family_name || 'User';
    
    // Find or create user
    let user = await User.findOne({ linkedinId });
    let isNewUser = false;
    
    if (!user) {
      // This is a new user
      isNewUser = true;
      user = await User.create({
        linkedinId,
        email,
        firstName,
        lastName,
        authProvider: 'linkedin',
        createdAt: new Date() // Ensure creation date is set
      });
    } else {
      // Update existing user with latest LinkedIn data
      user.email = email;
      user.firstName = firstName;
      user.lastName = lastName;
      await user.save();
    }
    
    // Generate token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Get the intended redirect destination based on new user status
    const redirectTo = isNewUser ? '/profile-setup' : (req.session.redirectTo || '/dashboard');
    
    console.log(`Redirecting LinkedIn auth to: ${process.env.FRONTEND_URL}/auth/callback?token=${token}&redirect=${encodeURIComponent(redirectTo)}&isNewUser=${isNewUser}`);
    
    // Redirect to frontend with token and isNewUser flag
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}&redirect=${encodeURIComponent(redirectTo)}&isNewUser=${isNewUser ? 'true' : 'false'}`);
  } catch (error) {
    console.error('Error during LinkedIn authentication:', error.response ? error.response.data : error.message);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
  }
});

// Google Routes - updated
// Google Routes - improved new user detection
app.get('/auth/google', (req, res) => {
  // Store the intended redirect destination if provided
  const redirectTo = req.query.redirectTo || '/dashboard';
  // Store it in the session for use after authentication
  req.session.redirectTo = redirectTo;
  
  passport.authenticate('google')(req, res);
});

app.get('/auth/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login?error=auth_failed' }),
  async (req, res) => {
    try {
      // Check if this is a new user
      // Use both explicit isNewUser flag from passport strategy and created timestamp
      const isNewUser = req.user.isNewUser || 
          (req.user.createdAt && ((new Date() - new Date(req.user.createdAt)) < 60000)); // Created within last minute
      
      console.log('Is new user:', isNewUser);
      console.log('User creation time:', req.user.createdAt);
      
      // Generate token
      const token = jwt.sign(
        { id: req.user._id, email: req.user.email },
        JWT_SECRET,
        { expiresIn: '30d' }
      );
      
      // The redirectTo should be profile-setup for new users, otherwise use session or default
      const redirectTo = isNewUser 
        ? '/profile-setup' 
        : (req.session.redirectTo || '/dashboard');
      
      // Add isNewUser flag to URL so frontend knows this is a new user
      const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?token=${token}&redirect=${encodeURIComponent(redirectTo)}&isNewUser=${isNewUser ? 'true' : 'false'}`;
      
      console.log(`Redirecting to: ${redirectUrl}`);
      
      // Redirect the user to the frontend with the token and new user flag
      res.redirect(redirectUrl);
    } catch (error) {
      console.error('Error in Google auth callback:', error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
    }
  }
);

// Add a convenient endpoint to get user data by token
app.get('/api/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password -deviceTokens -security.twoFactorSecret -security.twoFactorBackupCodes');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Get user data error:', error);
    res.status(500).json({ error: 'Error fetching user data' });
  }
});
// Phone Authentication Routes
app.post('/auth/phone/send-code', async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    await twilioClient.verify.v2.services(TWILIO_VERIFY_SERVICE)
      .verifications
      .create({ to: phoneNumber, channel: 'sms' });

    res.json({ message: 'Verification code sent' });
  } catch (error) {
    console.error('Send verification code error:', error);
    res.status(500).json({ error: 'Error sending verification code' });
  }
});

app.post('/auth/phone/verify', async (req, res) => {
  try {
    const { phoneNumber, code, deviceToken } = req.body;

    const verification = await twilioClient.verify.v2.services(TWILIO_VERIFY_SERVICE)
      .verificationChecks
      .create({ to: phoneNumber, code });

    if (!verification.valid) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }

    let user = await User.findOne({ phoneNumber });

    if (!user) {
      // Generate a random name for the user based on the phone number
      const randomName = `User${Math.floor(1000 + Math.random() * 9000)}`;
      
      user = await User.create({
        phoneNumber,
        phoneVerified: true,
        authProvider: 'phone',
        firstName: randomName,
        lastName: phoneNumber.slice(-4) // Last 4 digits as default last name
      });
    } else {
      user.phoneVerified = true;
      await user.save();
    }

    // Update user session and return token
    await updateUserAndReturnToken(user, deviceToken, res);
    
  } catch (error) {
    console.error('Verify phone error:', error);
    res.status(500).json({ error: 'Error verifying phone number' });
  }
});

// Two-Factor Authentication
app.post('/api/auth/2fa/setup', authenticateToken, async (req, res) => {
  try {
    const { method } = req.body;
    
    if (!['app', 'sms', 'email'].includes(method)) {
      return res.status(400).json({ error: 'Invalid 2FA method' });
    }
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Generate secret for app based 2FA
    let secret = null;
    let qrCodeUrl = null;
    
    if (method === 'app') {
      // Generate a secure secret
      secret = crypto.randomBytes(20).toString('hex');
      
      // In a real implementation, you would generate a QR code URL
      qrCodeUrl = `otpauth://totp/YourApp:${user.email}?secret=${secret}&issuer=YourApp`;
    }
    
    // Initialize security if doesn't exist
    if (!user.security) {
      user.security = {};
    }
    
    // Update user security settings
    user.security.twoFactorEnabled = false; // Not yet verified
    user.security.twoFactorMethod = method;
    user.security.twoFactorSecret = secret;
    
    // Generate backup codes
    const backupCodes = [];
    for (let i = 0; i < 10; i++) {
      backupCodes.push(crypto.randomBytes(4).toString('hex'));
    }
    user.security.twoFactorBackupCodes = backupCodes;
    
    await user.save();
    
    res.json({
      method,
      secret,
      qrCodeUrl,
      backupCodes,
      verified: false
    });
  } catch (error) {
    console.error('Setup 2FA error:', error);
    res.status(500).json({ error: 'Error setting up 2FA' });
  }
});

// Check auth provider for email/phone
app.post('/auth/check-provider', async (req, res) => {
  try {
    const { email, phoneNumber } = req.body;
    
    if (!email && !phoneNumber) {
      return res.status(400).json({ error: 'Email or phone number is required' });
    }
    
    let user;
    if (email) {
      user = await User.findOne({ email: email.toLowerCase() });
    } else {
      user = await User.findOne({ phoneNumber });
    }
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ authProvider: user.authProvider });
  } catch (error) {
    console.error('Check provider error:', error);
    res.status(500).json({ error: 'Error checking authentication provider' });
  }
});

// Logout - Revoke token
app.post('/api/auth/logout', authenticateToken, async (req, res) => {
  try {
    const token = req.headers['authorization'].split(' ')[1];
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Remove this session
    if (user.security && user.security.activeLoginSessions) {
      user.security.activeLoginSessions = user.security.activeLoginSessions.filter(
        session => session.token !== token
      );
    }
    
    // Mark user as offline
    user.online = false;
    user.lastActive = new Date();
    
    await user.save();
    
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Error logging out' });
  }
});// ----------------------
// USER PROFILE ROUTES
// ----------------------

app.put('/api/profile', authenticateToken, async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      headline,
      industry,
      skills,
      profilePicture,
      password,
      currentPassword,
      portfolio
    } = req.body;

    if (firstName === '') return res.status(400).json({ error: 'First name cannot be empty' });
    if (lastName === '') return res.status(400).json({ error: 'Last name cannot be empty' });

    // Get the current user with password field
    const currentUser = await User.findById(req.user.id);
    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updateFields = {};
    
    if (firstName) updateFields.firstName = firstName.trim();
    if (lastName) updateFields.lastName = lastName.trim();
    if (headline) updateFields.headline = headline.trim();
    if (industry) updateFields.industry = industry.trim();
    if (profilePicture) updateFields.profilePicture = profilePicture.trim();

    // Handle password update
    if (password) {
      // For users who signed up with social or phone, they might not have a password
      if (currentUser.authProvider !== 'local') {
        // Social/phone users can set a password without providing current password
        updateFields.password = password;
        // Update auth provider to include local option as well
        updateFields.authProvider = 'local';
      } else {
        // For users who already have a password, require current password
        if (!currentPassword) {
          return res.status(400).json({ error: 'Current password is required to update password' });
        }
        
        // Verify current password
        const isValidPassword = await currentUser.validatePassword(currentPassword);
        if (!isValidPassword) {
          return res.status(401).json({ error: 'Current password is incorrect' });
        }
        
        updateFields.password = password;
      }
    }

    // Handle skills update
    if (skills && Array.isArray(skills)) {
      updateFields.skills = skills.map(skill => 
        typeof skill === 'object' 
          ? { name: skill.name.trim(), endorsements: skill.endorsements || 0 }
          : { name: skill.trim(), endorsements: 0 }
      );
    }
    
    // Handle portfolio update
    if (portfolio) {
      // Initialize if doesn't exist
      if (!currentUser.portfolio) {
        currentUser.portfolio = {};
      }
      
      // Update specific portfolio fields
      if (portfolio.bio) updateFields['portfolio.bio'] = portfolio.bio;
      if (portfolio.about) updateFields['portfolio.about'] = portfolio.about;
      
      // Handle work experience
      if (portfolio.workExperience && Array.isArray(portfolio.workExperience)) {
        updateFields['portfolio.workExperience'] = portfolio.workExperience;
      }
      
      // Handle education
      if (portfolio.education && Array.isArray(portfolio.education)) {
        updateFields['portfolio.education'] = portfolio.education;
      }
      
      // Handle languages
      if (portfolio.languages && Array.isArray(portfolio.languages)) {
        updateFields['portfolio.languages'] = portfolio.languages;
      }
      
      // Handle certifications
      if (portfolio.certifications && Array.isArray(portfolio.certifications)) {
        updateFields['portfolio.certifications'] = portfolio.certifications;
      }
      
      // Handle interests
      if (portfolio.interests && Array.isArray(portfolio.interests)) {
        updateFields['portfolio.interests'] = portfolio.interests;
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateFields },
      { 
        new: true,
        select: '-password -deviceTokens -security.twoFactorSecret -security.twoFactorBackupCodes'
      }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Error updating profile' });
  }
});

// Get user profile
app.get('/api/users/:userId/profile', authenticateToken, async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    const currentUserId = req.user.id;
    
    // Check if current user is blocked by target user
    const targetUser = await User.findById(targetUserId)
      .select('-password -security -deviceTokens');
    
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check blocking relationship
    if (targetUser.blockedUsers && targetUser.blockedUsers.includes(currentUserId)) {
      return res.status(403).json({ error: 'User not available' });
    }
    
    if (currentUserId !== targetUserId) {
      const currentUser = await User.findById(currentUserId);
      if (currentUser.blockedUsers && currentUser.blockedUsers.includes(targetUserId)) {
        return res.status(403).json({ error: 'You have blocked this user' });
      }
      
      // Increment profile view count
      if (!targetUser.analytics) {
        targetUser.analytics = { profileViews: { count: 0, history: [] } };
      }
      
      targetUser.analytics.profileViews.count++;
      
      // Add to history
      const today = new Date().toISOString().split('T')[0];
      const historyEntry = targetUser.analytics.profileViews.history.find(
        entry => entry.date.toISOString().split('T')[0] === today
      );
      
      if (historyEntry) {
        historyEntry.count++;
      } else {
        targetUser.analytics.profileViews.history.push({
          date: new Date(),
          count: 1
        });
      }
      
      await targetUser.save();
    }
    
    // Get portfolio items
    const projects = await Project.find({
      user: targetUserId,
      $or: [
        { visibility: 'public' },
        { 
          visibility: 'connections',
          user: { $in: targetUser.connections }
        },
        { user: currentUserId }
      ]
    })
    .sort({ featured: -1, updatedAt: -1 })
    .limit(5);
    
    const streaks = await Streak.find({
      user: targetUserId,
      $or: [
        { visibility: 'public' },
        { 
          visibility: 'connections',
          user: { $in: targetUser.connections }
        },
        { user: currentUserId }
      ]
    })
    .sort({ currentStreak: -1 })
    .limit(5);
    
    const achievements = await Achievement.find({
      user: targetUserId,
      $or: [
        { visibility: 'public' },
        { 
          visibility: 'connections',
          user: { $in: targetUser.connections }
        },
        { user: currentUserId }
      ]
    })
    .sort({ featured: -1, dateAchieved: -1 })
    .limit(5);
    
    // Get recommendations
    const recommendations = await Recommendation.find({
      recipient: targetUserId,
      status: 'approved'
    })
    .populate('author', 'firstName lastName profilePicture')
    .sort({ featured: -1, createdAt: -1 });
    
    // Connection status
    const isConnected = targetUser.connections.includes(currentUserId);
    const isPending = targetUser.pendingConnections.includes(currentUserId);
    const isFollowing = targetUser.followers.includes(currentUserId);
    const isFollower = targetUser.following.includes(currentUserId);
    
    res.json({
      user: targetUser,
      portfolio: {
        projects,
        streaks,
        achievements
      },
      recommendations,
      relationshipStatus: {
        isConnected,
        isPending,
        isFollowing,
        isFollower
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ error: 'Error fetching user profile' });
  }
});

// Location update
app.put('/api/location', authenticateToken, async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`
    );

    const address = response.data.results[0]?.formatted_address || '';

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        location: {
          type: 'Point',
          coordinates: [longitude, latitude],
          address,
          lastUpdated: new Date()
        }
      },
      { new: true }
    );
    res.json(updatedUser);
  } catch (error) {
    console.error('Location update error:', error);
    res.status(500).json({ error: 'Error updating location' });
  }
});
// Add this to your server.js file, with your other API routes
app.get('/api/network/nearby', authenticateToken, async (req, res) => {
  try {
    const { distance = 10 } = req.query;
    const currentUser = await User.findById(req.user.id);
    
    if (!currentUser || !currentUser.location || !currentUser.location.coordinates) {
      return res.status(400).json({ error: 'User location not available' });
    }
    
    // Find users within the specified distance
    const nearbyUsers = await User.find({
      _id: { $ne: req.user.id },
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: currentUser.location.coordinates
          },
          $maxDistance: parseInt(distance) * 1000 // Convert km to meters
        }
      }
    })
    .select('firstName lastName profilePicture headline industry location')
    .limit(50);
    
    // Add connection status and calculate precise distance
    const results = await Promise.all(
      nearbyUsers.map(async (user) => {
        // Check connection status
        const isConnected = currentUser.connections.includes(user._id);
        const isPending = currentUser.pendingConnections.includes(user._id);
        
        // Calculate distance
        const distance = getDistanceFromLatLonInKm(
          currentUser.location.coordinates[1],
          currentUser.location.coordinates[0],
          user.location.coordinates[1],
          user.location.coordinates[0]
        );
        
        return {
          ...user.toObject(),
          connectionStatus: isConnected ? 'connected' : (isPending ? 'pending' : 'none'),
          distance: parseFloat(distance.toFixed(1))
        };
      })
    );
    
    res.json(results);
  } catch (error) {
    console.error('Get nearby professionals error:', error);
    res.status(500).json({ error: 'Error fetching nearby professionals' });
  }
});

// Helper function to calculate distance
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180);
}
// Privacy settings update
app.put('/api/privacy-settings', authenticateToken, async (req, res) => {
  try {
    const { privacy } = req.body;
    
    if (!privacy) {
      return res.status(400).json({ error: 'Privacy settings are required' });
    }
    
    const updateFields = {};
    
    if (privacy.profileVisibility) {
      updateFields['privacy.profileVisibility'] = privacy.profileVisibility;
    }
    
    if (privacy.storyVisibility) {
      updateFields['privacy.storyVisibility'] = privacy.storyVisibility;
    }
    
    if (privacy.messagePermission) {
      updateFields['privacy.messagePermission'] = privacy.messagePermission;
    }
    
    if (privacy.activityStatus !== undefined) {
      updateFields['privacy.activityStatus'] = privacy.activityStatus;
    }
    
    if (privacy.searchability !== undefined) {
      updateFields['privacy.searchability'] = privacy.searchability;
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateFields },
      { new: true }
    );
    
    res.json({
      privacy: updatedUser.privacy
    });
  } catch (error) {
    console.error('Privacy settings update error:', error);
    res.status(500).json({ error: 'Error updating privacy settings' });
  }
});

// ----------------------
// USER RELATIONSHIP ROUTES
// ----------------------

// Connection request
app.get('/api/network/connection-requests', authenticateToken, async (req, res) => {
  try {
    // Find the current user
    const currentUser = await User.findById(req.user.id);
    
    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get users who have sent connection requests to the current user
    const connectionRequests = await User.find({
      _id: { $in: currentUser.pendingConnections }
    })
    .select('firstName lastName profilePicture headline createdAt')
    .sort('-createdAt');
    
    // Calculate mutual connections
    const result = await Promise.all(connectionRequests.map(async (request) => {
      // Find mutual connections (users who are connected to both parties)
      const mutualConnections = currentUser.connections.filter(connection => 
        request.connections?.includes(connection)
      ).length;
      
      return {
        ...request.toObject(),
        mutualConnections
      };
    }));
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching connection requests:', error);
    res.status(500).json({ error: 'Error fetching connection requests' });
  }
});
app.post('/api/connections/request', authenticateToken, async (req, res) => {
  try {
    const { targetUserId } = req.body;
    
    if (targetUserId === req.user.id) {
      return res.status(400).json({ error: 'Cannot connect with yourself' });
    }
    
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if already connected
    if (targetUser.connections.includes(req.user.id)) {
      return res.status(400).json({ error: 'Already connected' });
    }
    
    // Check if request already pending
    if (targetUser.pendingConnections.includes(req.user.id)) {
      return res.status(400).json({ error: 'Connection request already pending' });
    }
    
    // Check if blocked
    if (targetUser.blockedUsers.includes(req.user.id)) {
      return res.status(403).json({ error: 'Cannot send connection request' });
    }
    
    // Add to pending connections
    targetUser.pendingConnections.push(req.user.id);
    await targetUser.save();
    
    // Create notification
    await createNotification({
      recipient: targetUserId,
      sender: req.user.id,
      type: 'connection_request',
      contentType: 'user',
      contentId: req.user.id,
      text: `${req.user.firstName} ${req.user.lastName} sent you a connection request`,
      actionUrl: `/connections/pending`
    });
    
    res.json({ message: 'Connection request sent' });
  } catch (error) {
    console.error('Connection request error:', error);
    res.status(500).json({ error: 'Error sending connection request' });
  }
});
// Add this endpoint to your server code to handle the GET /api/network/connections route

app.get('/api/network/connections', authenticateToken, async (req, res) => {
  try {
    const { type = 'all' } = req.query;
    const currentUser = await User.findById(req.user.id);
    
    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    let userIds = [];
    
    // Filter connections based on type
    if (type === 'all' || type === 'connections') {
      userIds = [...currentUser.connections];
    } else if (type === 'following') {
      userIds = [...currentUser.following];
    } else if (type === 'followers') {
      userIds = [...currentUser.followers];
    }
    
    // Fetch connection users with basic profile information
    const connections = await User.find({ 
      _id: { $in: userIds } 
    })
    .select('firstName lastName profilePicture headline industry')
    .sort('firstName lastName');
    
    // Add relationship context
    const result = connections.map(connection => {
      const isFollowing = currentUser.following.includes(connection._id);
      const isFollower = currentUser.followers.includes(connection._id);
      const isConnected = currentUser.connections.includes(connection._id);
      
      return {
        ...connection.toObject(),
        isFollowing,
        isFollower,
        isConnected
      };
    });
    
    res.json(result);
  } catch (error) {
    console.error('Get connections error:', error);
    res.status(500).json({ error: 'Error fetching connections' });
  }
});
// Accept connection
app.post('/api/connections/accept', authenticateToken, async (req, res) => {
  try {
    const { senderUserId } = req.body;
    
    const currentUser = await User.findById(req.user.id);
    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if request exists
    if (!currentUser.pendingConnections.includes(senderUserId)) {
      return res.status(400).json({ error: 'No pending connection request from this user' });
    }
    
    const senderUser = await User.findById(senderUserId);
    if (!senderUser) {
      return res.status(404).json({ error: 'Sender user not found' });
    }
    
    // Remove from pending
    currentUser.pendingConnections = currentUser.pendingConnections.filter(
      id => id.toString() !== senderUserId
    );
    
    // Add to connections
    currentUser.connections.push(senderUserId);
    senderUser.connections.push(req.user.id);
    
    await Promise.all([currentUser.save(), senderUser.save()]);
    
    // Create notification
    await createNotification({
      recipient: senderUserId,
      sender: req.user.id,
      type: 'connection_accepted',
      contentType: 'user',
      contentId: req.user.id,
      text: `${currentUser.firstName} ${currentUser.lastName} accepted your connection request`,
      actionUrl: `/profile/${req.user.id}`
    });
    
    res.json({ message: 'Connection accepted' });
  } catch (error) {
    console.error('Accept connection error:', error);
    res.status(500).json({ error: 'Error accepting connection' });
  }
});

// Decline connection
app.post('/api/connections/decline', authenticateToken, async (req, res) => {
  try {
    const { senderUserId } = req.body;
    
    const currentUser = await User.findById(req.user.id);
    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Remove from pending
    currentUser.pendingConnections = currentUser.pendingConnections.filter(
      id => id.toString() !== senderUserId
    );
    
    await currentUser.save();
    
    res.json({ message: 'Connection declined' });
  } catch (error) {
    console.error('Decline connection error:', error);
    res.status(500).json({ error: 'Error declining connection' });
  }
});

// Follow user
app.post('/api/users/:userId/follow', authenticateToken, async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    
    if (targetUserId === req.user.id) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }
    
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const currentUser = await User.findById(req.user.id);
    
    // Check if target user has blocked current user
    if (targetUser.blockedUsers && targetUser.blockedUsers.includes(req.user.id)) {
      return res.status(403).json({ error: 'Unable to follow user' });
    }
    
    const isFollowing = currentUser.following.includes(targetUserId);
    
    if (isFollowing) {
      // Unfollow user
      currentUser.following = currentUser.following.filter(id => 
        id.toString() !== targetUserId
      );
      
      targetUser.followers = targetUser.followers.filter(id => 
        id.toString() !== req.user.id
      );
    } else {
      // Follow user
      currentUser.following.push(targetUserId);
      targetUser.followers.push(req.user.id);
      
      // Create notification for target user
      createNotification({
        recipient: targetUserId,
        sender: req.user.id,
        type: 'follow',
        contentType: 'user',
        contentId: req.user.id,
        text: `${currentUser.firstName} ${currentUser.lastName} started following you`,
        actionUrl: `/profile/${req.user.id}`
      });
    }
    
    await Promise.all([currentUser.save(), targetUser.save()]);
    
    res.json({
      following: !isFollowing,
      followerCount: targetUser.followers.length,
      followingCount: currentUser.following.length
    });
  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({ error: 'Error updating follow status' });
  }
});
// Add this endpoint to your server code to handle the GET /api/network/suggestions route

app.get('/api/network/suggestions', authenticateToken, async (req, res) => {
  try {
    const { industry, skills, limit = 20 } = req.query;
    const currentUser = await User.findById(req.user.id);
    
    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Build the query to find relevant users
    let query = {
      _id: { $ne: currentUser._id }, // Exclude current user
      // Exclude users that are already connected or blocked
      _id: { 
        $nin: [
          ...currentUser.connections || [], 
          ...currentUser.blockedUsers || [],
          ...currentUser.pendingConnections || []
        ] 
      }
    };
    
    // Add industry filter if specified
    if (industry) {
      query.industry = industry;
    } else if (currentUser.industry) {
      // Use current user's industry as a fallback
      query.industry = currentUser.industry;
    }
    
    // Add skills filter if specified
    if (skills) {
      const skillsArray = skills.split(',');
      query['skills.name'] = { $in: skillsArray };
    }
    
    // Find users matching the criteria
    const suggestions = await User.find(query)
      .select('firstName lastName profilePicture headline industry skills')
      .limit(parseInt(limit));
    
    // Add context about the relationship with each user
    const result = suggestions.map(user => {
      const isFollowing = currentUser.following && currentUser.following.includes(user._id);
      const isFollower = currentUser.followers && currentUser.followers.includes(user._id);
      
      // Calculate number of mutual connections
      const mutualConnections = user.connections ? 
        user.connections.filter(connectionId => 
          currentUser.connections && currentUser.connections.includes(connectionId)
        ).length : 0;
      
      return {
        ...user.toObject(),
        isFollowing,
        isFollower,
        mutualConnections,
        connectionStatus: 'none'
      };
    });
    
    res.json(result);
  } catch (error) {
    console.error('Get suggestions error:', error);
    res.status(500).json({ error: 'Error fetching suggested professionals' });
  }
});
// Block user
app.post('/api/users/:userId/block', authenticateToken, async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    
    if (targetUserId === req.user.id) {
      return res.status(400).json({ error: 'Cannot block yourself' });
    }
    
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const currentUser = await User.findById(req.user.id);
    
    const isBlocked = currentUser.blockedUsers.includes(targetUserId);
    
    if (isBlocked) {
      // Unblock user
      currentUser.blockedUsers = currentUser.blockedUsers.filter(id => 
        id.toString() !== targetUserId
      );
    } else {
      // Block user
      currentUser.blockedUsers.push(targetUserId);
      
      // Remove from connections, followers, following
      currentUser.connections = currentUser.connections.filter(id => 
        id.toString() !== targetUserId
      );
      
      currentUser.followers = currentUser.followers.filter(id => 
        id.toString() !== targetUserId
      );
      
      currentUser.following = currentUser.following.filter(id => 
        id.toString() !== targetUserId
      );
      
      // Remove from target user's connections, followers, following
      targetUser.connections = targetUser.connections.filter(id => 
        id.toString() !== req.user.id
      );
      
      targetUser.followers = targetUser.followers.filter(id => 
        id.toString() !== req.user.id
      );
      
      targetUser.following = targetUser.following.filter(id => 
        id.toString() !== req.user.id
      );
    }
    
    await Promise.all([currentUser.save(), targetUser.save()]);
    
    res.json({
      blocked: !isBlocked
    });
  } catch (error) {
    console.error('Block user error:', error);
    res.status(500).json({ error: 'Error updating block status' });
  }
});

// ----------------------
// CHAT ROUTES
// ----------------------

// In your chat routes
app.post('/api/chats', authenticateToken, async (req, res) => {
  try {
    const { participantId, type = 'direct', name = '', description = '' } = req.body;

    // If direct chat, check for existing chat first
    if (type === 'direct') {
      const existingChat = await ChatRoom.findOne({
        type: 'direct',
        participants: { 
          $all: [req.user.id, participantId],
          $size: 2
        }
      }).populate('participants', 'firstName lastName profilePicture');

      if (existingChat) {
        return res.json(existingChat);
      }
    }

    // Create new chat
    const chatRoom = await ChatRoom.create({
      type,
      name,
      description,
      participants: type === 'direct' ? [req.user.id, participantId] : [req.user.id],
      admin: req.user.id
    });

    // Populate participants for response
    await chatRoom.populate('participants', 'firstName lastName profilePicture');

    res.status(201).json(chatRoom);
  } catch (error) {
    console.error('Create chat error:', error);
    res.status(500).json({ error: 'Error creating chat', details: error.message });
  }
});

app.get('/api/chats', authenticateToken, async (req, res) => {
  try {
    const chats = await ChatRoom.find({
      participants: req.user.id
    })
    .populate('participants', 'firstName lastName profilePicture online lastActive')
    .populate('lastMessage')
    .sort('-lastActivity')
    .exec();

    res.json(chats);
  } catch (error) {
    console.error('Get chats error:', error);
    res.status(500).json({ error: 'Error fetching chats' });
  }
});
const testUpload = multer({ dest: 'uploads/' });
// Simplified CloudinaryStorage
const simpleStoryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'stories',
    resource_type: 'auto'
  }
});

const simpleStoryUpload = multer({ storage: simpleStoryStorage });

app.post('/api/simple-cloudinary-test', simpleStoryUpload.single('media'), (req, res) => {
  console.log('File received and uploaded to Cloudinary:', req.file);
  res.json({ 
    success: true, 
    message: 'File uploaded to Cloudinary', 
    file: req.file ? req.file.path : 'No file'
  });
});
app.post('/api/simple-test-upload', storyUpload.single('media'), (req, res) => {
  console.log('File received:', req.file);
  res.json({ success: true, message: 'File received' });
});
app.post('/api/chats/:chatId/messages', authenticateToken, async (req, res) => {
  try {
    const { content, messageType } = req.body;
    
    // Validate inputs
    if (!req.params.chatId) {
      return res.status(400).json({ error: 'Chat ID is required' });
    }
    
    const chatRoom = await ChatRoom.findById(req.params.chatId);
    if (!chatRoom) {
      return res.status(404).json({ error: 'Chat room not found' });
    }

    // Handle file uploads if present
    let mediaUrl = null;
    if (req.file) {
      mediaUrl = req.file.path;
    }

    const message = await Message.create({
      sender: req.user.id,
      recipient: chatRoom.participants.find(
        participantId => participantId.toString() !== req.user.id
      ),
      chatRoom: req.params.chatId,
      content,
      messageType,
      mediaUrl
    });

    // Populate sender and recipient details
    await message.populate('sender', 'firstName lastName profilePicture');
    await message.populate('recipient', 'firstName lastName profilePicture');

    // Update chat room's last message
    await ChatRoom.findByIdAndUpdate(req.params.chatId, {
      lastMessage: message._id,
      lastActivity: new Date()
    });

    res.status(201).json(message);
  } catch (error) {
    console.error('Send message server error:', error);
    res.status(500).json({ 
      error: 'Error sending message', 
      details: error.message 
    });
  }
});

app.get('/api/chats/:chatId/messages', authenticateToken, async (req, res) => {
  try {
    const { limit = 50, before, after, lastMessageId } = req.query;
    
    let query = {
      chatRoom: req.params.chatId,
      deletedFor: { $ne: req.user.id }
    };

    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }
    
    if (after) {
      query.createdAt = { $gt: new Date(after) };
    }

    if (lastMessageId) {
      const lastMessage = await Message.findById(lastMessageId);
      if (lastMessage) {
        query.createdAt = { $gt: lastMessage.createdAt };
      }
    }

    const messages = await Message.find(query)
      .populate('sender', 'firstName lastName profilePicture')
      .populate('recipient', 'firstName lastName profilePicture')
      .populate('replyTo')
      .sort('createdAt')
      .limit(parseInt(limit));

    const hasMore = messages.length === parseInt(limit);
    const nextCursor = hasMore ? messages[messages.length - 1]._id : null;

    res.json({
      messages,
      hasMore,
      nextCursor
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Error fetching messages' });
  }
});
// Enhanced chat features - Video/Audio calls
app.post('/api/chats/:chatId/call', authenticateToken, async (req, res) => {
  try {
    const { callType } = req.body;
    
    if (!['audio', 'video'].includes(callType)) {
      return res.status(400).json({ error: 'Invalid call type' });
    }
    
    const chatRoom = await ChatRoom.findById(req.params.chatId);
    
    if (!chatRoom) {
      return res.status(404).json({ error: 'Chat room not found' });
    }
    
    // Check if user is a participant
    const isParticipant = chatRoom.participants.some(
      participant => participant.toString() === req.user.id
    );
    
    if (!isParticipant) {
      return res.status(403).json({ error: 'Not authorized to initiate call' });
    }
    
    // Create call history entry
    const callHistory = {
      initiator: req.user.id,
      callType,
      startTime: new Date(),
      participants: [{
        user: req.user.id,
        joinedAt: new Date()
      }],
      status: 'missed' // Default status until someone joins
    };
    
    chatRoom.callHistory.push(callHistory);
    await chatRoom.save();
    
    // Create system message about call
    await Message.create({
      sender: req.user.id,
      recipient: chatRoom.participants.find(id => id.toString() !== req.user.id),
      chatRoom: chatRoom._id,
      content: `${callType === 'audio' ? 'Audio' : 'Video'} call started`,
      messageType: 'call',
      metadata: {
        callId: chatRoom.callHistory[chatRoom.callHistory.length - 1]._id,
        callType
      }
    });
    
    // Notify other participants through WebSocket
    if (wss) {
      chatRoom.participants
        .filter(participantId => participantId.toString() !== req.user.id)
        .forEach(participantId => {
          [...wss.clients]
            .filter(client => 
              client.userId === participantId.toString() && 
              client.readyState === WebSocket.OPEN
            )
            .forEach(client => {
              client.send(JSON.stringify({
                type: 'incoming_call',
                data: {
                  chatId: chatRoom._id,
                  callId: chatRoom.callHistory[chatRoom.callHistory.length - 1]._id,
                  callType,
                  initiator: req.user.id
                }
              }));
            });
        });
    }
    
    res.json({
      callId: chatRoom.callHistory[chatRoom.callHistory.length - 1]._id,
      startTime: callHistory.startTime
    });
  } catch (error) {
    console.error('Initiate call error:', error);
    res.status(500).json({ error: 'Error initiating call' });
  }
});

// Chat polls
app.post('/api/chats/:chatId/polls', authenticateToken, async (req, res) => {
  try {
    const { question, options, multipleChoice, expiresIn } = req.body;
    
    if (!question || !options || !Array.isArray(options) || options.length < 2) {
      return res.status(400).json({ error: 'Invalid poll data' });
    }
    
    const chatRoom = await ChatRoom.findById(req.params.chatId);
    
    if (!chatRoom) {
      return res.status(404).json({ error: 'Chat room not found' });
    }
    
    // Check if user is a participant
    const isParticipant = chatRoom.participants.some(
      participant => participant.toString() === req.user.id
    );
    
    if (!isParticipant) {
      return res.status(403).json({ error: 'Not authorized to create poll' });
    }
    
    // Create poll
    const pollOptions = options.map(option => ({
      text: option,
      votes: []
    }));
    
    // Calculate expiration time (default: 24 hours)
    const expirationHours = expiresIn ? parseInt(expiresIn) : 24;
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expirationHours);
    
    const poll = {
      creator: req.user.id,
      question,
      options: pollOptions,
      multipleChoice: multipleChoice === true,
      expiresAt,
      createdAt: new Date()
    };
    
    chatRoom.polls.push(poll);
    await chatRoom.save();
    
    // Send message about poll creation
    const message = await Message.create({
      sender: req.user.id,
      recipient: chatRoom.participants[0],
      chatRoom: chatRoom._id,
      content: `Created poll: ${question}`,
      messageType: 'poll',
      metadata: {
        pollId: chatRoom.polls[chatRoom.polls.length - 1]._id
      }
    });
    
    // Update chat room last message
    chatRoom.lastMessage = message._id;
    chatRoom.lastActivity = new Date();
    await chatRoom.save();
    
    // Notify participants through WebSocket
    if (wss) {
      chatRoom.participants.forEach(participantId => {
        [...wss.clients]
          .filter(client => 
            client.userId === participantId.toString() && 
            client.readyState === WebSocket.OPEN
          )
          .forEach(client => {
            client.send(JSON.stringify({
              type: 'new_poll',
              data: {
                chatId: chatRoom._id,
                poll: chatRoom.polls[chatRoom.polls.length - 1],
                message: message
              }
            }));
          });
      });
    }
    
    res.status(201).json(chatRoom.polls[chatRoom.polls.length - 1]);
  } catch (error) {
    console.error('Create poll error:', error);
    res.status(500).json({ error: 'Error creating poll' });
  }
});

// ----------------------
// STORY ROUTES
// ----------------------

app.post('/api/stories', authenticateToken, storyUpload.single('media'), async (req, res) => {
  try {
    console.log('Starting story creation...');
    console.log('User: ', req.user ? req.user.id : 'No user');
    console.log('File: ', req.file ? 'File uploaded' : 'No file');
    console.log('Content: ', req.body.content || 'No content');
    
    if (!req.file) {
      return res.status(400).json({ error: 'Media file is required' });
    }
    
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Create minimal story first to test
    const story = await Story.create({
      author: req.user.id,
      content: req.body.content || 'Default caption',
      mediaUrl: req.file.path,
      mediaType: req.file.mimetype.startsWith('image/') ? 'image' : 'video',
      filter: req.body.filter || 'none',
      textPosition: req.body.textPosition || 'bottom',
    });
    
    console.log('Story created successfully with ID:', story._id);
    res.status(201).json(story);
  } catch (error) {
    console.error('Story creation error:', error);
    res.status(500).json({ error: 'Error creating story', message: error.message });
  }
});


app.get('/api/stories', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const connections = user.connections || [];
    const following = user.following || [];
    
    // Get stories from connections, following, and self
    const visibleUsers = [...new Set([...connections, ...following, req.user.id])];

    const stories = await Story.find({
      author: { $in: visibleUsers },
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    })
    .populate('author', 'firstName lastName profilePicture')
    .populate('mentions.user', 'firstName lastName profilePicture')
    .populate('reactions.user', 'firstName lastName profilePicture')
    .populate('replies.user', 'firstName lastName profilePicture')
    .sort('-createdAt');

    // Group stories by author
    const storiesByAuthor = {};
    stories.forEach(story => {
      const authorId = story.author._id.toString();
      if (!storiesByAuthor[authorId]) {
        storiesByAuthor[authorId] = {
          author: story.author,
          stories: []
        };
      }
      
      // Check if this user has viewed the story
      const hasViewed = story.viewers.some(viewer => 
        viewer.user.toString() === req.user.id
      );
      
      // Check if this user has reacted to the story
      const userReaction = story.reactions.find(reaction => 
        reaction.user._id.toString() === req.user.id
      );
      
      storiesByAuthor[authorId].stories.push({
        ...story.toObject(),
        viewed: hasViewed,
        userReaction: userReaction ? userReaction.reaction : null
      });
    });

    // Convert to array
    const result = Object.values(storiesByAuthor);
    
    res.json(result);
  } catch (error) {
    console.error('Get stories error:', error);
    res.status(500).json({ error: 'Error fetching stories' });
  }
});

app.post('/api/stories/:storyId/react', authenticateToken, async (req, res) => {
  try {
    const { reaction } = req.body;
    
    if (!reaction || !['heart', 'laugh', 'wow', 'sad', 'angry', 'fire', 'clap', 'question'].includes(reaction)) {
      return res.status(400).json({ error: 'Invalid reaction type' });
    }
    
    const story = await Story.findById(req.params.storyId);
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }
    
    // Check if user already reacted
    const existingReaction = story.reactions.find(
      r => r.user.toString() === req.user.id && r.reaction === reaction
    );
    
    if (existingReaction) {
      // Remove reaction if same type already exists (toggle behavior)
      story.reactions = story.reactions.filter(
        r => !(r.user.toString() === req.user.id && r.reaction === reaction)
      );
    } else {
      // Remove any existing reactions of different types from this user
      story.reactions = story.reactions.filter(
        r => r.user.toString() !== req.user.id
      );
      
      // Add new reaction
      story.reactions.push({
        user: req.user.id,
        reaction,
        createdAt: new Date()
      });
      
      // Notify story author if it's not their own reaction
      if (story.author.toString() !== req.user.id) {
        const user = await User.findById(req.user.id);
        
        await createNotification({
          recipient: story.author,
          sender: req.user.id,
          type: 'reaction',
          contentType: 'story',
          contentId: story._id,
          text: `${user.firstName} ${user.lastName} reacted to your story with ${reaction}`,
          actionUrl: `/stories/view/${story._id}`
        });
      }
    }
    
    await story.save();
    
    res.json({
      success: true,
      reactionCount: story.reactions.length,
      hasReacted: !existingReaction // true if added, false if removed
    });
  } catch (error) {
    console.error('Story reaction error:', error);
    res.status(500).json({ error: 'Error reacting to story' });
  }
});

app.post('/api/stories/:storyId/view', authenticateToken, async (req, res) => {
  try {
    const story = await Story.findById(req.params.storyId);
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }

    if (!story.viewers.some(viewer => viewer.user.equals(req.user.id))) {
      story.viewers.push({ user: req.user.id });
      await story.save();
    }

    res.json({ message: 'Story viewed' });
  } catch (error) {
    console.error('View story error:', error);
    res.status(500).json({ error: 'Error marking story as viewed' });
  }
});
app.post('/api/stories/:storyId/reply', authenticateToken, async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message || typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({ error: 'Reply message is required' });
    }
    
    const story = await Story.findById(req.params.storyId);
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }
    
    // Add reply
    story.replies.push({
      user: req.user.id,
      message: message.trim(),
      createdAt: new Date()
    });
    
    await story.save();
    
    // Populate user details for the new reply
    const populatedStory = await Story.findById(story._id)
      .populate('replies.user', 'firstName lastName profilePicture');
    
    const newReply = populatedStory.replies[populatedStory.replies.length - 1];
    
    // Notify story author if it's not their own reply
    if (story.author.toString() !== req.user.id) {
      const user = await User.findById(req.user.id);
      
      await createNotification({
        recipient: story.author,
        sender: req.user.id,
        type: 'comment',
        contentType: 'story',
        contentId: story._id,
        text: `${user.firstName} ${user.lastName} replied to your story: "${message.length > 30 ? message.slice(0, 30) + '...' : message}"`,
        actionUrl: `/stories/view/${story._id}`
      });
    }
    
    res.json(newReply);
  } catch (error) {
    console.error('Story reply error:', error);
    res.status(500).json({ error: 'Error replying to story' });
  }
});

// Highlight routes
app.post('/api/highlights', authenticateToken, async (req, res) => {
  try {
    const { title, stories } = req.body;
    
    const highlight = await Highlight.create({
      author: req.user.id,
      title,
      stories
    });

    res.status(201).json(highlight);
  } catch (error) {
    console.error('Create highlight error:', error);
    res.status(500).json({ error: 'Error creating highlight' });
  }
});

app.get('/api/highlights/:userId', authenticateToken, async (req, res) => {
  try {
    const highlights = await Highlight.find({ author: req.params.userId })
      .populate('author', 'firstName lastName profilePicture')
      .sort('-createdAt');

    res.json(highlights);
  } catch (error) {
    console.error('Get highlights error:', error);
    res.status(500).json({ error: 'Error fetching highlights' });
  }
});
app.post('/api/posts', authenticateToken, postUpload.array('media', 10), async (req, res) => {
  try {
    const {
      content,
      type,
      visibility,
      location,
      mentions,
      tags,
      pollData,
      articleData,
      linkUrl,
      captions
    } = req.body;
    
    // Validate content requirement
    if (!content && !req.files?.length && !linkUrl && !pollData && !articleData) {
      return res.status(400).json({ error: 'Post must have content, media, link, poll, or article data' });
    }
    
    // Determine post type based on provided data
    let postType = type || 'text';
    if (!type) {
      if (req.files?.length > 0) {
        postType = req.files[0].mimetype.startsWith('image/') ? 'image' : 'video';
      } else if (linkUrl) {
        postType = 'link';
      } else if (pollData) {
        postType = 'poll';
      } else if (articleData) {
        postType = 'article';
      }
    }
    
    // Process location data
    let locationData = null;
    if (location) {
      try {
        locationData = typeof location === 'string' ? JSON.parse(location) : location;
      } catch (error) {
        console.error('Error parsing location data:', error);
      }
    }
    
    // Process mentions data
    let mentionsData = [];
    if (mentions) {
      try {
        mentionsData = typeof mentions === 'string' ? JSON.parse(mentions) : mentions;
      } catch (error) {
        console.error('Error parsing mentions data:', error);
      }
    }
    
    // Process tags/hashtags
    let parsedTags = [];
    if (tags) {
      parsedTags = typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()) : tags;
    }
    
    // Extract hashtags from content
    const hashtagRegex = /#([a-zA-Z0-9_]+)/g;
    const hashtagMatches = content ? [...content.matchAll(hashtagRegex)] : [];
    const contentHashtags = hashtagMatches.map(match => match[1].toLowerCase());
    
    // Combine explicit tags and content hashtags
    const allTags = [...new Set([...parsedTags, ...contentHashtags])];
    
    // Process media files and captions
    let images = [];
    let videos = [];
    
    if (req.files && req.files.length > 0) {
      let parsedCaptions = {};
      
      if (captions) {
        try {
          parsedCaptions = typeof captions === 'string' ? JSON.parse(captions) : captions;
        } catch (error) {
          console.error('Error parsing captions:', error);
        }
      }
      
      req.files.forEach((file, index) => {
        if (file.mimetype.startsWith('image/')) {
          images.push({
            url: file.path,
            caption: parsedCaptions[index] || '',
            altText: parsedCaptions[index] || '',
            order: index
          });
        } else if (file.mimetype.startsWith('video/')) {
          videos.push({
            url: file.path,
            thumbnail: '', // Cloudinary can generate this automatically
            caption: parsedCaptions[index] || '',
            duration: 0 // To be determined later
          });
        }
      });
    }
    
    // Process link preview if URL provided
    let linkPreviewData = null;
    if (linkUrl) {
      // In a real app, you would use a service like OpenGraph to fetch metadata
      // For now, we'll just store the URL
      linkPreviewData = {
        url: linkUrl,
        title: '',
        description: '',
        imageUrl: ''
      };
      
      // You could add URL metadata extraction here using a library like 'open-graph-scraper'
    }
    
    // Process poll data
    let processedPollData = null;
    if (pollData) {
      try {
        const parsed = typeof pollData === 'string' ? JSON.parse(pollData) : pollData;
        
        if (!parsed.question || !parsed.options || !Array.isArray(parsed.options) || parsed.options.length < 2) {
          return res.status(400).json({ error: 'Poll must have a question and at least 2 options' });
        }
        
        processedPollData = {
          question: parsed.question,
          options: parsed.options.map(option => ({
            text: option,
            votes: []
          })),
          expiresAt: parsed.expiresAt ? new Date(parsed.expiresAt) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default 1 week
          allowMultipleVotes: parsed.allowMultipleVotes || false
        };
      } catch (error) {
        console.error('Error parsing poll data:', error);
        return res.status(400).json({ error: 'Invalid poll data format' });
      }
    }
    
    // Process article data
    let processedArticleData = null;
    if (articleData) {
      try {
        processedArticleData = typeof articleData === 'string' ? JSON.parse(articleData) : articleData;
      } catch (error) {
        console.error('Error parsing article data:', error);
      }
    }
    
    // Create the post
    const post = await Post.create({
      author: req.user.id,
      content: content || '',
      type: postType,
      images,
      videos,
      visibility: visibility || 'public',
      location: locationData,
      mentions: mentionsData,
      hashtags: contentHashtags,
      linkPreview: linkPreviewData,
      pollData: processedPollData,
      articleData: processedArticleData,
      tags: allTags
    });
    
    // Process hashtags to update global hashtag counts
    if (allTags.length > 0) {
      await updateHashtags(allTags, 'post');
    }
    
    // Process mentions to create notifications and mention records
    if (mentionsData.length > 0) {
      const user = await User.findById(req.user.id)
        .select('firstName lastName');
      
      for (const mention of mentionsData) {
        // Create notification
        await createNotification({
          recipient: mention.user,
          sender: req.user.id,
          type: 'mention',
          contentType: 'post',
          contentId: post._id,
          text: `${user.firstName} ${user.lastName} mentioned you in a post`,
          actionUrl: `/posts/${post._id}`
        });
        
        // Create mention record
        await Mention.create({
          user: mention.user,
          mentionedBy: req.user.id,
          contentType: 'post',
          contentId: post._id
        });
      }
    }
    
    // Populate the post for response
    const populatedPost = await Post.findById(post._id)
      .populate('author', 'firstName lastName profilePicture headline')
      .populate('mentions.user', 'firstName lastName profilePicture')
      .populate('likes.user', 'firstName lastName profilePicture');
    
    res.status(201).json(populatedPost);
  } catch (error) {
    console.error('Create post error:', error);
    
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File size exceeded. Maximum file size is 100MB.' });
    }
    
    if (error.message && error.message.includes('Invalid file type')) {
      return res.status(400).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Error creating post' });
  }
});
app.post('/api/posts/:postId/react', authenticateToken, async (req, res) => {
  try {
    const { reaction } = req.body;
    
    if (!reaction || !['like', 'love', 'celebrate', 'support', 'insightful', 'curious'].includes(reaction)) {
      return res.status(400).json({ error: 'Invalid reaction type' });
    }
    
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    // Check if user already reacted
    const existingLike = post.likes.find(like => like.user.toString() === req.user.id);
    
    if (existingLike) {
      if (existingLike.reaction === reaction) {
        // Remove reaction if same type (toggle)
        post.likes = post.likes.filter(like => like.user.toString() !== req.user.id);
      } else {
        // Update reaction type
        existingLike.reaction = reaction;
        existingLike.createdAt = new Date();
      }
    } else {
      // Add new reaction
      post.likes.push({
        user: req.user.id,
        reaction,
        createdAt: new Date()
      });
      
      // Notify post author if it's not their own post
      if (post.author.toString() !== req.user.id) {
        const user = await User.findById(req.user.id)
          .select('firstName lastName');
        
        await createNotification({
          recipient: post.author,
          sender: req.user.id,
          type: 'like',
          contentType: 'post',
          contentId: post._id,
          text: `${user.firstName} ${user.lastName} reacted to your post with ${reaction}`,
          actionUrl: `/posts/${post._id}`
        });
        
        // Update analytics
        await User.findByIdAndUpdate(post.author, {
          $inc: { 'analytics.contentEngagement.likes': 1 }
        });
      }
    }
    
    await post.save();
    
    // Count reactions by type
    const reactionCounts = {};
    post.likes.forEach(like => {
      if (!reactionCounts[like.reaction]) {
        reactionCounts[like.reaction] = 0;
      }
      reactionCounts[like.reaction]++;
    });
    
    // Get user's current reaction
    const userReaction = post.likes.find(like => like.user.toString() === req.user.id)?.reaction || null;
    
    res.json({
      success: true,
      reactionCounts,
      totalLikes: post.likes.length,
      userReaction
    });
  } catch (error) {
    console.error('Post reaction error:', error);
    res.status(500).json({ error: 'Error updating post reaction' });
  }
});
// ----------------------
// DISCOVERY SYSTEM ROUTES
// ----------------------

// Event Routes
app.post('/api/events', authenticateToken, upload.single('coverImage'), async (req, res) => {
  try {
    const {
      title, description, eventType, category, tags,
      startDate, endDate, location, privacy
    } = req.body;

    // Parse location 
    let locationData = {};
    if (typeof location === 'string') {
      try {
        locationData = JSON.parse(location);
      } catch (e) {
        locationData = { address: location };
      }
    } else if (typeof location === 'object') {
      locationData = location;
    }

    const event = await Event.create({
      creator: req.user.id,
      title,
      description,
      eventType,
      category,
      tags: tags ? (typeof tags === 'string' ? tags.split(',') : tags) : [],
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      location: locationData,
      coverImage: req.file ? req.file.path : req.body.coverImage,
      privacy,
      attendees: [{ user: req.user.id, status: 'going' }]
    });

    // Update hashtags if provided
    if (tags) {
      const tagsArray = typeof tags === 'string' ? tags.split(',') : tags;
      await updateHashtags(tagsArray, 'event');
    }

    const populatedEvent = await Event.findById(event._id)
      .populate('creator', 'firstName lastName profilePicture')
      .populate('attendees.user', 'firstName lastName profilePicture');

    res.status(201).json(populatedEvent);
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ error: 'Error creating event' });
  }
});

app.get('/api/events', authenticateToken, async (req, res) => {
  try {
    const {
      category, startDate, endDate, location, distance,
      lat, lng, tags, page = 1, limit = 10
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    let query = {};

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by date range
    if (startDate || endDate) {
      query.startDate = {};
      if (startDate) query.startDate.$gte = new Date(startDate);
      if (endDate) query.endDate.$lte = new Date(endDate);
    } else {
      // By default, only show upcoming events
      query.startDate = { $gte: new Date() };
    }

    // Filter by location proximity
    if (lat && lng && distance) {
      query['location.coordinates'] = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(distance) * 1000 // Convert km to meters
        }
      };
    } else if (location) {
      query['location.city'] = location;
    }

    // Filter by tags
    if (tags) {
      const tagArray = tags.split(',');
      query.tags = { $in: tagArray };
    }

    // Privacy filter (only show public events or events where user is invited)
    query.$or = [
      { privacy: 'public' },
      { privacy: 'invite-only', 'attendees.user': req.user.id },
      { creator: req.user.id }
    ];

    const events = await Event.find(query)
      .populate('creator', 'firstName lastName profilePicture')
      .populate('attendees.user', 'firstName lastName profilePicture')
      .sort({ startDate: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalEvents = await Event.countDocuments(query);

    res.json({
      events,
      pagination: {
        total: totalEvents,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(totalEvents / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ error: 'Error fetching events' });
  }
});

// Podcast Routes
app.post('/api/podcasts', authenticateToken, upload.single('coverImage'), async (req, res) => {
  try {
    const {
      title, description, category, tags
    } = req.body;
    
    const podcast = await Podcast.create({
      creator: req.user.id,
      title,
      description,
      coverImage: req.file ? req.file.path : req.body.coverImage,
      category,
      tags: tags ? (typeof tags === 'string' ? tags.split(',') : tags) : [],
      episodes: []
    });
    
    // Update hashtags if provided
    if (tags) {
      const tagsArray = typeof tags === 'string' ? tags.split(',') : tags;
      await updateHashtags(tagsArray, 'podcast');
    }
    
    const populatedPodcast = await Podcast.findById(podcast._id)
      .populate('creator', 'firstName lastName profilePicture');
    
    res.status(201).json(populatedPodcast);
  } catch (error) {
    console.error('Create podcast error:', error);
    res.status(500).json({ error: 'Error creating podcast' });
  }
});

// Job Routes
app.post('/api/jobs', authenticateToken, async (req, res) => {
  try {
    const {
      title, description, jobType, location, salary,
      requirements, responsibilities, skills, experienceLevel,
      industry, applicationDeadline, applicationLink, company
    } = req.body;
    
    // Validate company information
    let companyId = null;
    if (company && company.companyId) {
      const companyDoc = await Company.findById(company.companyId);
      if (!companyDoc) {
        return res.status(404).json({ error: 'Company not found' });
      }
      
      // Check if user has permission to post for this company
      const isAdmin = companyDoc.admins.some(admin => 
        admin.toString() === req.user.id
      );
      
      if (!isAdmin) {
        return res.status(403).json({ error: 'Not authorized to post jobs for this company' });
      }
      
      companyId = company.companyId;
    }
    
    const job = await Job.create({
      creator: req.user.id,
      title,
      description,
      jobType,
      location,
      salary,
      requirements: requirements ? (typeof requirements === 'string' ? requirements.split(',') : requirements) : [],
      responsibilities: responsibilities ? (typeof responsibilities === 'string' ? responsibilities.split(',') : responsibilities) : [],
      skills: skills ? (typeof skills === 'string' ? skills.split(',') : skills) : [],
      experienceLevel,
      industry,
      applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : null,
      applicationLink,
      company: {
        companyId,
        name: company ? company.name : undefined,
        logo: company ? company.logo : undefined,
        website: company ? company.website : undefined
      }
    });
    
    // Update hashtags for skills
    if (skills) {
      const skillsArray = typeof skills === 'string' ? skills.split(',') : skills;
      await updateHashtags(skillsArray, 'job');
    }
    
    res.status(201).json(job);
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ error: 'Error creating job' });
  }
});

// Discovery Dashboard API
app.get('/api/discover', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get user's skills, industry, location
    const userSkills = user.skills ? user.skills.map(s => s.name) : [];
    const userIndustry = user.industry;
    const userLocation = user.location;
    
    // Get personalized content
    // 1. Recommended Events
    const recommendedEvents = await Event.find({
      privacy: 'public',
      startDate: { $gte: new Date() },
      $or: [
        { category: userIndustry },
        { tags: { $in: userSkills } }
      ]
    })
    .populate('creator', 'firstName lastName profilePicture')
    .sort({ startDate: 1 })
    .limit(5);
    
    // 2. Trending Podcasts
    const trendingPodcasts = await Podcast.find({})
      .sort({ 'subscribers.length': -1, createdAt: -1 })
      .populate('creator', 'firstName lastName profilePicture')
      .limit(5);
    
    // 3. Relevant Jobs
    let jobQuery = { active: true };
    if (userSkills.length > 0) {
      jobQuery.skills = { $in: userSkills };
    }
    if (userIndustry) {
      jobQuery.industry = userIndustry;
    }
    
    const relevantJobs = await Job.find(jobQuery)
      .populate('creator', 'firstName lastName profilePicture')
      .sort({ createdAt: -1 })
      .limit(5);
    
    // 4. Featured Projects
    const featuredProjects = await Project.find({
      featured: true,
      visibility: 'public'
    })
    .populate('user', 'firstName lastName profilePicture')
    .sort({ updatedAt: -1 })
    .limit(5);
    
    // 5. Content from connections
    const connectionIds = user.connections || [];
    const connectionContent = {
      events: await Event.find({
        creator: { $in: connectionIds },
        privacy: 'public',
        startDate: { $gte: new Date() }
      })
      .populate('creator', 'firstName lastName profilePicture')
      .sort({ startDate: 1 })
      .limit(3),
      
      podcasts: await Podcast.find({
        creator: { $in: connectionIds }
      })
      .populate('creator', 'firstName lastName profilePicture')
      .sort({ updatedAt: -1 })
      .limit(3),
      
      projects: await Project.find({
        user: { $in: connectionIds },
        visibility: { $in: ['public', 'connections'] }
      })
      .populate('user', 'firstName lastName profilePicture')
      .sort({ updatedAt: -1 })
      .limit(3)
    };
    
    // 6. Trending hashtags
    const trendingHashtags = await Hashtag.find({ trending: true })
      .sort({ 
        eventCount: -1, 
        podcastCount: -1, 
        jobCount: -1 
      })
      .limit(10);
    
    res.json({
      recommendedEvents,
      trendingPodcasts,
      relevantJobs,
      featuredProjects,
      connectionContent,
      trendingHashtags
    });
  } catch (error) {
    console.error('Discover dashboard error:', error);
    res.status(500).json({ error: 'Error loading discover content' });
  }
});

// ----------------------
// PORTFOLIO SYSTEM ROUTES
// ----------------------

// Project Routes
app.post('/api/projects', authenticateToken, upload.array('attachments', 5), async (req, res) => {
  try {
    const {
      title, description, category, tags, status,
      startDate, endDate, collaborators, links,
      milestones, visibility
    } = req.body;
    
    let processedCollaborators = [];
    if (collaborators) {
      try {
        processedCollaborators = typeof collaborators === 'string' 
          ? JSON.parse(collaborators) 
          : collaborators;
      } catch (e) {
        console.error('Error parsing collaborators:', e);
        processedCollaborators = [];
      }
    }
    
    let processedLinks = [];
    if (links) {
      try {
        processedLinks = typeof links === 'string' 
          ? JSON.parse(links) 
          : links;
      } catch (e) {
        console.error('Error parsing links:', e);
        processedLinks = [];
      }
    }
    
    let processedMilestones = [];
    if (milestones) {
      try {
        processedMilestones = typeof milestones === 'string' 
          ? JSON.parse(milestones) 
          : milestones;
      } catch (e) {
        console.error('Error parsing milestones:', e);
        processedMilestones = [];
      }
    }
    
    // Process uploaded files
    const attachments = req.files ? req.files.map(file => ({
      title: file.originalname,
      fileUrl: file.path,
      fileType: file.mimetype
    })) : [];
    
    const project = await Project.create({
      user: req.user.id,
      title,
      description,
      category,
      tags: tags ? (typeof tags === 'string' ? tags.split(',') : tags) : [],
      status,
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : null,
      collaborators: processedCollaborators,
      attachments,
      links: processedLinks,
      milestones: processedMilestones,
      visibility
    });
    
    // Notify collaborators
    if (processedCollaborators && processedCollaborators.length > 0) {
      for (const collab of processedCollaborators) {
        createNotification({
          recipient: collab.user,
          sender: req.user.id,
          type: 'project_collaboration',
          contentType: 'project',
          contentId: project._id,
          text: `${req.user.firstName} ${req.user.lastName} added you as a collaborator on project: ${title}`,
          actionUrl: `/projects/${project._id}`
        });
      }
    }
    
    const populatedProject = await Project.findById(project._id)
      .populate('user', 'firstName lastName profilePicture')
      .populate('collaborators.user', 'firstName lastName profilePicture')
      .populate('likes', 'firstName lastName profilePicture');
    
    res.status(201).json(populatedProject);
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Error creating project' });
  }
});

// Streak Routes
app.post('/api/streaks', authenticateToken, async (req, res) => {
  try {
    const {
      title, description, category, target, customFrequency,
      activity, startDate, visibility, reminderTime
    } = req.body;
    
    let parsedCustomFrequency;
    if (customFrequency) {
      try {
        parsedCustomFrequency = typeof customFrequency === 'string' 
          ? JSON.parse(customFrequency) 
          : customFrequency;
      } catch (e) {
        console.error('Error parsing customFrequency:', e);
      }
    }
    
    const streak = await Streak.create({
      user: req.user.id,
      title,
      description,
      category,
      target,
      customFrequency: parsedCustomFrequency,
      activity,
      startDate: startDate ? new Date(startDate) : new Date(),
      visibility,
      reminderTime: reminderTime ? new Date(reminderTime) : undefined
    });
    
    res.status(201).json(streak);
  } catch (error) {
    console.error('Create streak error:', error);
    res.status(500).json({ error: 'Error creating streak' });
  }
});

// Achievement Routes
app.post('/api/achievements', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const {
      title, description, category, dateAchieved,
      issuer, certificateUrl, verificationUrl, 
      expirationDate, visibility, featured
    } = req.body;
    
    const achievement = await Achievement.create({
      user: req.user.id,
      title,
      description,
      category,
      dateAchieved: new Date(dateAchieved),
      issuer,
      certificateUrl,
      verificationUrl,
      expirationDate: expirationDate ? new Date(expirationDate) : undefined,
      image: req.file ? req.file.path : req.body.image,
      visibility,
      featured: featured === 'true' || featured === true
    });
    
    res.status(201).json(achievement);
  } catch (error) {
    console.error('Create achievement error:', error);
    res.status(500).json({ error: 'Error creating achievement' });
  }
});

// ----------------------
// COMPANY ROUTES
// ----------------------

app.post('/api/companies', authenticateToken, upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'coverImage', maxCount: 1 }
]), async (req, res) => {
  try {
    const {
      name, description, website,
      industry, size, founded, headquarters, locations
    } = req.body;
    
    let parsedHeadquarters;
    if (headquarters) {
      try {
        parsedHeadquarters = typeof headquarters === 'string' 
          ? JSON.parse(headquarters) 
          : headquarters;
      } catch (e) {
        console.error('Error parsing headquarters:', e);
      }
    }
    
    let parsedLocations;
    if (locations) {
      try {
        parsedLocations = typeof locations === 'string' 
          ? JSON.parse(locations) 
          : locations;
      } catch (e) {
        console.error('Error parsing locations:', e);
        parsedLocations = [];
      }
    }
    
    const company = await Company.create({
      name,
      description,
      logo: req.files && req.files.logo ? req.files.logo[0].path : null,
      coverImage: req.files && req.files.coverImage ? req.files.coverImage[0].path : null,
      website,
      industry,
      size,
      founded: parseInt(founded),
      headquarters: parsedHeadquarters,
      locations: parsedLocations || [],
      admins: [req.user.id],
      employees: [{
        user: req.user.id,
        position: 'Founder',
        verified: true
      }]
    });
    
    res.status(201).json(company);
  } catch (error) {
    console.error('Create company error:', error);
    res.status(500).json({ error: 'Error creating company' });
  }
});

// ----------------------
// DATABASE CONNECTION AND SERVER START
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

const server = http.createServer(app);

// Create Socket.IO server with CORS configuration


// Connected users mapping





mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/professionals_network')
  .then(() => {
    console.log('Connected to MongoDB');
    
    // Create HTTP server
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`\nServer running on port ${PORT}`);
      // In your server.js or socket configuration file
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:5173',   // Development frontend URL
      'http://localhost:3000',   // If your backend is also serving frontend
      /\.yourdomain\.com$/       // Production domain pattern
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  },
  path: '/socket.io/',            // Explicit socket path
  pingTimeout: 60000,             // Increased timeout
  pingInterval: 25000             // Ping interval
});

// Enhanced authentication middleware
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth.token || 
                 socket.handshake.query.token;
    
    if (!token) {
      return next(new Error('Authentication error: Token required'));
    }
    
    // More robust token verification
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'],
      maxAge: '30d'
    });
    
    // Additional validation
    if (!decoded.id) {
      return next(new Error('Invalid token payload'));
    }
    
    socket.userId = decoded.id;
    socket.userEmail = decoded.email;
    next();
  } catch (error) {
    console.error('Socket authentication error:', error);
    next(new Error(`Authentication failed: ${error.message}`));
  }
});
      const nets = networkInterfaces();
      console.log('\nServer accessible at:');
      console.log(`- Local: ${BASE_URL}`);
      
      for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
          if (net.family === 'IPv4' && !net.internal) {
            console.log(`- Network: http://${net.address}:${PORT}`);
          }
        }
      }
      // Near the top of your file where Cloudinary is set up
console.log('Cloudinary config status:', !!cloudinary.config().cloud_name);

    });
  
    // Initialize WebSocket Server
 

   //Continuing with WebSocket connection handling from part 4

// WebSocket heartbeat



// Error handling middleware
app.use((req, res, next) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});
})
module.exports = app;
