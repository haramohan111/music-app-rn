// models/Music.js
const mongoose = require('mongoose');

const musicSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  artist: {
    type: String,
    required: true,
    trim: true
  },
  album: {
    type: String,
    trim: true
  },
  genre: {
    type: String,
    trim: true
  },
  releaseDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  audioFile: {
    type: String,
    required: true
  },
  coverImage: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Music', musicSchema);