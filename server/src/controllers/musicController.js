// controllers/musicController.js
const multer = require('multer');
const path = require('path');
const Music = require('../models/Music');
const fs = require('fs');
const jsmediatags = require('jsmediatags');


// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'audioFile') {
      cb(null, 'uploads/audio/');
    } else if (file.fieldname === 'coverImage') {
      cb(null, 'uploads/images/');
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'audioFile') {
    if (!file.mimetype.startsWith('audio/')) {
      return cb(new Error('Please upload an audio file'), false);
    }
  } else if (file.fieldname === 'coverImage') {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Please upload an image file'), false);
    }
  }
  cb(null, true);
};

exports.upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 50 // 50MB max for audio files
  }
});

exports.addMusic = async (req, res) => {
  try {
    const { title, artist, album, genre, releaseDate } = req.body;
    
    // Validate required fields
    if (!title || !artist || !req.files.audioFile) {
      return res.status(400).json({ 
        success: false,
        message: 'Title, artist and audio file are required' 
      });
    }
    console.log("nnnn",req.files);
console.log("nnnn",req.files.audioFile[0].path);
console.log("nnnn",req.files.coverImage[0].path);

    // Create new music document
    const newMusic = new Music({
      title,
      artist,
      album: album || undefined,
      genre: genre || undefined,
      releaseDate: releaseDate || undefined,
      audioFile: req.files.audioFile[0].filename,
      coverImage: req.files.coverImage ? req.files.coverImage[0].filename: undefined
    });

    await newMusic.save();

    res.status(201).json({
      success: true,
      message: 'Music added successfully',
      data: newMusic
    });

  } catch (error) {
    console.error('Error adding music:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to add music',
      error: error.message 
    });
  }
};

exports.addOnlyMusic = async (req, res) => {
  try {
    if (!req.files?.audioFile) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const audioFile = req.files.audioFile[0];
    const filename = path.parse(audioFile.originalname).name;

    // Set default metadata that will always work
    const defaultMetadata = {
      title: filename || 'Untitled Track',
      artist: 'Unknown Artist', // Required field
      album: '',
      genre: '',
      year: '',
      duration: 0
    };

    let metadata = {...defaultMetadata};
    let coverImage = null;

    // Try to read tags if file exists
    if (fs.existsSync(audioFile.path)) {
      try {
        const fileData = fs.readFileSync(audioFile.path);
        const tagData = await new Promise((resolve) => {
          new jsmediatags.Reader(fileData)
            .setTagsToRead(['title', 'artist', 'album', 'genre', 'year', 'picture'])
            .read({
              onSuccess: resolve,
              onError: () => resolve(null) // Silently fail
            });
        });

        if (tagData?.tags) {
          // Only update fields that exist in tags
          if (tagData.tags.title) metadata.title = tagData.tags.title;
          if (tagData.tags.artist) metadata.artist = tagData.tags.artist;
          if (tagData.tags.album) metadata.album = tagData.tags.album;
          if (tagData.tags.genre) metadata.genre = tagData.tags.genre;
          if (tagData.tags.year) metadata.year = tagData.tags.year;

          // Handle cover image
          if (tagData.tags.picture) {
            const { format, data } = tagData.tags.picture;
            const ext = format.split('/')[1] || 'jpg';
            const coverFilename = `coverImage-${Date.now()}.${ext}`;
            console.log("coverFilename",coverFilename);
            const coverPath = path.join(__dirname, '../../uploads/covers', coverFilename);
            
            // Ensure directory exists
            if (!fs.existsSync(path.dirname(coverPath))) {
              fs.mkdirSync(path.dirname(coverPath), { recursive: true });
            }
            
            fs.writeFileSync(coverPath, Buffer.from(data));
            coverImage = `${coverFilename}`;
          }
        }
      } catch (tagError) {
        console.log('Metadata extraction failed, using defaults');
      }
    }

    // Save to database
    const songData = new Music({
      ...metadata,
      audioFile: `${audioFile.filename}`,
      coverImage
    });

    await songData.save();

    return res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
      song: songData
    });

  } catch (error) {
    console.error('Upload failed:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Upload processing failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

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

exports.getMusicById = async (req, res) => {
  try {
    const { id } = req.params;
    const music = await Music.findById(id);
    
    if (!music) {
      return res.status(404).json({ 
        success: false,
        message: 'Music not found' 
      });
    }
    
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
}



exports.updateMusic = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, artist, album, genre, status } = req.body;

    // Validate required fields
    if (!title || !artist) {
      return res.status(400).json({ 
        success: false,
        message: 'Title and artist are required' 
      });
    }

    // Find music by ID
    const music = await Music.findById(id);
    
    if (!music) {
      return res.status(404).json({ 
        success: false,
        message: 'Music not found' 
      });
    }

    // Store previous file paths for cleanup
    const previousAudioPath = music.audioFile 
      ? path.join('uploads/audio/', music.audioFile)
      : null;
    const previousCoverPath = music.coverImage 
      ? path.join('uploads/images/', music.coverImage)
      : null;

    // Update fields
    music.title = title;
    music.artist = artist;
    music.album = album || undefined;
    music.genre = genre || undefined;
    music.status = status || 'Active';

    // Handle file updates
    if (req.files?.audioFile) {
      // Delete previous audio file if it exists
      if (previousAudioPath && fs.existsSync(previousAudioPath)) {
        fs.unlinkSync(previousAudioPath);
      }
      music.audioFile = req.files.audioFile[0].filename;
    }
    
    if (req.files?.coverImage) {
      // Delete previous cover image if it exists
      if (previousCoverPath && fs.existsSync(previousCoverPath)) {
        fs.unlinkSync(previousCoverPath);
      }
      music.coverImage = req.files.coverImage[0].filename;
    }

    await music.save();

    res.status(200).json({
      success: true,
      message: 'Music updated successfully',
      data: music
    });

  } catch (error) {
    console.error('Error updating music:', error);
    
    // Clean up newly uploaded files if error occurred
    if (req.files?.audioFile) {
      const newAudioPath = path.join('uploads/audio/', req.files.audioFile[0].filename);
      if (fs.existsSync(newAudioPath)) fs.unlinkSync(newAudioPath);
    }
    if (req.files?.coverImage) {
      const newImagePath = path.join('uploads/images/', req.files.coverImage[0].filename);
      if (fs.existsSync(newImagePath)) fs.unlinkSync(newImagePath);
    }

    res.status(500).json({ 
      success: false,
      message: 'Failed to update music',
      error: error.message 
    });
  }
};

exports.toggleMusicStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate required fields
    if (!status) {
      return res.status(400).json({ 
        success: false,
        message: 'Status is required' 
      });
    }

    // Find music by ID
    const music = await Music.findById(id);
    
    if (!music) {
      return res.status(404).json({ 
        success: false,
        message: 'Music not found' 
      });
    }

    // Update status
    music.status = status;

    await music.save();

    res.status(200).json({
      success: true,
      message: 'Music status updated successfully',
      data: music
    });

  } catch (error) {
    console.error('Error updating music status:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update music status',
      error: error.message 
    });
  }
};
// Bulk delete music
// This function deletes multiple music entries based on an array of IDs
exports.bulkDeleteMusic = async (req, res) => {
  try {
    const { ids } = req.body;
    
    // Validate input
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request. Please provide an array of music IDs to delete.'
      });
    }

    // First get the files to be deleted
    const musicItems = await Music.find({ _id: { $in: ids } });
    
    // Delete files from filesystem
  const uploadsDir = path.join(process.cwd(), 'uploads');

   if (!fs.existsSync(uploadsDir)) {
      console.error('ERROR: Uploads directory does not exist at:', uploadsDir);
      throw new Error('Uploads directory not found');
    }
    
    musicItems.forEach(item => {
      if (item.coverImage) {
        const coverPath = path.join(uploadsDir, 'images', item.coverImage);

        if (fs.existsSync(coverPath)) {
          fs.unlinkSync(coverPath);
        }
      }
      if (item.audioFile) {
        const audioPath = path.join(uploadsDir, 'audio', item.audioFile);

        if (fs.existsSync(audioPath)) {
          fs.unlinkSync(audioPath);
        }
      }
    });

    // Then delete from database
    const result = await Music.deleteMany({ _id: { $in: ids } });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'No music items found with the provided IDs.'
      });
    }

    res.json({
      success: true,
      message: `Successfully deleted ${result.deletedCount} music item(s) and associated files`,
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error('Error in bulkDeleteMusic:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during bulk deletion',
      error: error.message
    });
  }
};

// Delete single music
exports.deleteMusic = async (req, res) => {
  try {
    const { id } = req.params

    // Validate input
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request. Please provide a music ID to delete.'
      });
    }

    // Find the music item
    const musicItem = await Music.findById(id);
    
    if (!musicItem) {
      return res.status(404).json({
        success: false,
        message: 'Music item not found'
      });
    }

    // Delete files from filesystem
    const uploadsDir = path.join(process.cwd(), 'uploads');

    if (!fs.existsSync(uploadsDir)) {
      console.error('ERROR: Uploads directory does not exist at:', uploadsDir);
      throw new Error('Uploads directory not found');
    }
    
    if (musicItem.coverImage) {
      const coverPath = path.join(uploadsDir, 'images', musicItem.coverImage);

      if (fs.existsSync(coverPath)) {
        fs.unlinkSync(coverPath);
      }
    }
    
    if (musicItem.audioFile) {
      const audioPath = path.join(uploadsDir, 'audio', musicItem.audioFile);

      if (fs.existsSync(audioPath)) {
        fs.unlinkSync(audioPath);
      }
    }

    // Delete from database
    await Music.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Music item deleted successfully'
    });

  } catch (error) {
    console.error('Error in deleteMusic:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during deletion',
      error: error.message
    });
  }
};


