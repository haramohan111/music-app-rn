const User = require('../../models/User');
const Music = require('../../models/Music');
const Playlist = require('../../models/Playlist');
const PlaylistSongs = require('../../models/PlaylistSongs');


exports.getAllMusic = async (req, res) => {
  try {
    const music = await Music.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: music
    });
  } catch (error) {
    console.error('Error fetching music:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch music',
      error: error.message 
    });
  }
};

exports.playlist = async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).send({ error: 'Playlist name is required' });
    }

    // Check if playlist with this name already exists for the user
    const existingPlaylist = await Playlist.findOne({
      name: name.trim(),
      owner: req.user._id
    });

    if (existingPlaylist) {
      return res.status(400).send({ 
        error: 'You already have a playlist with this name' 
      });
    }

    const playlist = new Playlist({
      name: name.trim(),
      owner: req.user._id
    });

    await playlist.save();
    res.status(201).send(playlist);
  } catch (error) {
    // Handle duplicate key error from MongoDB
    if (error.code === 11000) {
      return res.status(400).send({ 
        error: 'You already have a playlist with this name' 
      });
    }
    res.status(400).send({ error: error.message });
  }
}

exports.getPopularAlbums = async (req, res) => {
  try {
    const music = await Music.find().sort({ createdAt: -1 }).limit(10);
    res.status(200).json({
      success: true,
      data: music
    });
  } catch (error) {
    console.error('Error fetching popular albums:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch popular albums',
      error: error.message 
    });
  }
}

exports.getAllPlaylists = async (req, res) => {
  try {
    const playlists = await Playlist.find({ owner: req.user._id });
    res.status(200).json({
      success: true,
      data: playlists
    });
  } catch (error) {
    console.error('Error fetching playlists:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch playlists',
      error: error.message 
    });
  }
}

exports.addSongsToPlaylist = async (req, res) => {
  try {
    const { musicId, playlistId } = req.body;

    if (!playlistId || !musicId) {
      return res.status(400).send({ error: "Invalid request data" });
    }

    // Check if the playlist belongs to the user
    const playlist = await Playlist.findOne({ _id: playlistId, owner: req.user._id });
    if (!playlist) {
      return res.status(404).send({ error: "Playlist not found or does not belong to user" });
    }

    // ✅ Check if this song is already in the playlist
    const existing = await PlaylistSongs.findOne({ playlist: playlistId, songs: musicId });
    if (existing) {
      return res.status(400).send({ error: "Song already exists in this playlist" });
    }

    // Add song to playlist
    const playlistSongs = new PlaylistSongs({
      playlist: playlistId,
      songs: musicId,
    });

    await playlistSongs.save();
    res.status(201).send(playlistSongs);
  } catch (error) {
    console.error("Error adding songs to playlist:", error);
    res.status(500).send({ error: error.message });
  }
};


exports.getPlaylistSongs = async (req, res) => {
  try {
    const { playlistId } = req.params;

    if (!playlistId) {
      return res.status(400).send({ error: 'Playlist ID is required' });
    }

    // Check if the playlist belongs to the user
    const playlist = await Playlist.findOne({ _id: playlistId, owner: req.user._id });
    if (!playlist) {
      return res.status(404).send({ error: 'Playlist not found or does not belong to user' });
    }

    const songs = await PlaylistSongs.find({ playlist: playlistId }).populate('songs');
    res.status(200).json({
      success: true,
      data: songs
    });
  } catch (error) {
    console.error('Error fetching playlist songs:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch playlist songs',
      error: error.message 
    });
  }
}

exports.removeSongFromPlaylist = async (req, res) => {
  try {
    const { playlistId, songId } = req.params;
console.log('Playlist ID:', playlistId);
    console.log('Song ID:', songId);
    // Delete the song from playlist
    const result = await PlaylistSongs.deleteOne({ playlist:playlistId, songs:songId });

    if (result.deletedCount > 0) {
      return res.status(200).json({
        success: true,
        message: 'Song removed from playlist successfully',
      });
    } else {
      return res.status(404).json({
        success: false,
        message: 'Song not found in playlist',
      });
    }
  } catch (error) {
    console.error('Error removing song from playlist:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while removing song from playlist',
    });
  }
};
