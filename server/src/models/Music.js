const mongoose = require('mongoose');

const musicSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    artist: { type: String, required: true, trim: true },
    album: { type: String, default: '', trim: true },
    genre: { type: String, default: '', trim: true },

    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },

    // Cloudinary audio
    audioUrl: { type: String, required: true },
    audioPublicId: { type: String }, // optional but handy (for deletes)
    audioOriginalName: { type: String }, // like "audioFile-xxxxx.mp3"

    // Cloudinary cover
    coverUrl: { type: String, default: '' },
    coverPublicId: { type: String },
    coverOriginalName: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Music', musicSchema);
