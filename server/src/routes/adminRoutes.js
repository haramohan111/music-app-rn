const express = require('express');
const { createDummyAdmin, verifyUser, refreshToken,logout } = require('../controllers/authController');
const musicController = require('../controllers/musicController');
 const { authenticate } = require('../middlewares/authAdmin');
 const upload = require('../middlewares/upload');
const router = express.Router();

router.get('/dd', createDummyAdmin);
router.get("/me", verifyUser)
router.post("/admin-refresh-token", refreshToken);
router.post('/logout', logout);

router.post('/add-music',authenticate , musicController.upload.fields([{ name: 'audioFile', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 }]),musicController.addMusic);

// router.post('/add-only-music',authenticate , musicController.upload.fields([{ name: 'audioFile', maxCount: 1 },
//     { name: 'coverImage', maxCount: 1 }]),musicController.addOnlyMusic);

//cloudanary upload
router.post('/add-only-music-cloudanary',authenticate, upload.fields([{ name: 'audioFile', maxCount: 1 }]), musicController.addOnlyMusicCloudanary);

router.get('/music-list',authenticate , musicController.getAllMusic);

router.get('/musicbyid/:id',authenticate , musicController.getMusicById);
router.put('/update-music/:id',authenticate , musicController.upload.fields([{ name: 'audioFile', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 }]),musicController.updateMusic);
router.patch('/music-toggle-status/:id',authenticate , musicController.toggleMusicStatus); 

router.post('/music-bulk-delete',authenticate , musicController.bulkDeleteMusic);
router.delete('/music-delete/:id',authenticate , musicController.deleteMusic);

module.exports = router;