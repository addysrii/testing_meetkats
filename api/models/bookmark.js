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
  
  const Bookmark = mongoose.model('Bookmark', bookmarkSchema);
export default Bookmark  