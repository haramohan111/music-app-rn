const mongoose = require('mongoose');

const playlistSongsSchema = new mongoose.Schema({
  playlist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Playlist',
    required: true
  },
  songs: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Music',
    required: true
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
});
module.exports = mongoose.model('PlaylistSongs', playlistSongsSchema);