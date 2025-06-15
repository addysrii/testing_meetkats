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

  const Notification = mongoose.model('Notification', notificationSchema);
  export default Notification;
