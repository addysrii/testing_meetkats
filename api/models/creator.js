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
const CreatorProgram = mongoose.model('CreatorProgram', creatorProgramSchema);
export default CreatorProgram;