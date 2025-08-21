const express = require('express');
const router = express.Router();
const authController = require('../controllers/frontend/authController');
const musicController = require('../controllers/frontend/musicController');
const auth = require('../middlewares/auth');
const bcrypt = require('bcrypt');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get("/frontme", authController.verifyUser)
router.post('/userlogout', authController.logout);

router.get('/allmusic', musicController.getAllMusic);
router.post('/playlists', auth,musicController.playlist);
router.post('/web-refresh-token', authController.webrefreshToken);
router.get('/popularalbum', musicController.getPopularAlbums);
router.get('/getall-playlists', auth, musicController.getAllPlaylists);
router.post('/add-songs-to-playlist', auth, musicController.addSongsToPlaylist);
router.get('/get-playlist-songs/:playlistId', auth, musicController.getPlaylistSongs);
router.delete('/remove-song-from-playlist/:playlistId/:songId', auth, musicController.removeSongFromPlaylist);
router.post('/logout', authController.logout);


router.get('/generate-password', async (req, res) => {
  try {
    const plainPassword = '123123'; // or req.query.password
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    res.json({
      raw: plainPassword,
      hashed: hashedPassword,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate password' });
  }
});

module.exports = router;