import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { updateMusic, fetchMusicById } from '../../redux/features/music/ManageMusicSlice';
import '../../styles/EditMusic.css';

const EditMusic = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { currentMusic, status, error } = useSelector(state => state.manageMusic);
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    album: '',
    genre: '',
    status: 'Active'
  });
  const [audioFile, setAudioFile] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [previewImage, setPreviewImage] = useState('');
  const [audioPreview, setAudioPreview] = useState('');
  const audioRef = useRef(null);

  useEffect(() => {
    dispatch(fetchMusicById(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (currentMusic) {
      setFormData({
        title: currentMusic?.data?.title || '',
        artist: currentMusic?.data?.artist || '',
        album: currentMusic?.data?.album || '',
        genre: currentMusic?.data?.genre || '',
        status: currentMusic?.data?.status || 'Active'
      });
      setPreviewImage(currentMusic?.data?.coverImage 
        ? `http://localhost:5000/images/${currentMusic?.data?.coverImage}` 
        : '');
    }
  }, [currentMusic]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAudioChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAudioFile(file);
      // Create preview URL for the new audio file
      const audioURL = URL.createObjectURL(file);
      setAudioPreview(audioURL);
      
      // Clean up previous audio URL if it exists
      if (audioPreview) {
        URL.revokeObjectURL(audioPreview);
      }
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImage(file);
      // Create preview URL for the new image
      const imageURL = URL.createObjectURL(file);
      setPreviewImage(imageURL);
      
      // Clean up previous image URL if it exists
      if (previewImage && !previewImage.includes('localhost:5000')) {
        URL.revokeObjectURL(previewImage);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formDataToSend = new FormData();
    formDataToSend.append('title', formData.title);
    formDataToSend.append('artist', formData.artist);
    formDataToSend.append('album', formData.album);
    formDataToSend.append('genre', formData.genre);
    formDataToSend.append('status', formData.status);
    
    if (audioFile) formDataToSend.append('audioFile', audioFile);
    if (coverImage) formDataToSend.append('coverImage', coverImage);

    try {
      await dispatch(updateMusic({ id, formData: formDataToSend })).unwrap();
      navigate('/admin/music/manage-music');
    } catch (error) {
      console.error('Failed to update music:', error);
    }
  };

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      if (audioPreview) {
        URL.revokeObjectURL(audioPreview);
      }
      if (previewImage && !previewImage.includes('localhost:5000')) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [audioPreview, previewImage]);

  if (status === 'loading') return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="edit-music-container">
      <h2>Edit Music</h2>
      
      <form onSubmit={handleSubmit} className="edit-music-form">
        
        {/* Row 1: Basic Info */}
        <div className="form-row">
          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Artist *</label>
            <input
              type="text"
              name="artist"
              value={formData.artist}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Album</label>
            <input
              type="text"
              name="album"
              value={formData.album}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Row 2: Metadata */}
        <div className="form-row">
          <div className="form-group">
            <label>Genre</label>
            <select name="genre" value={formData.genre} onChange={handleChange}>
              <option value="">Select Genre</option>
              <option value="Pop">Pop</option>
              <option value="Rock">Rock</option>
              <option value="Hip Hop">Hip Hop</option>
              <option value="Electronic">Electronic</option>
              <option value="Classical">Classical</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Status</label>
            <select name="status" value={formData.status} onChange={handleChange}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Audio Preview</label>
            {(audioPreview || (currentMusic?.data?.audioFile && !audioFile)) ? (
              <audio 
                controls 
                className="current-audio"
                ref={audioRef}
                src={audioPreview || `http://localhost:5000/audio/${currentMusic?.data?.audioFile}`}
              />
            ) : (
              <div className="no-audio">No audio file</div>
            )}
          </div>
        </div>

        {/* Row 3: File Uploads */}
        <div className="form-row">
          <div className="form-group file-upload">
            <label>Update Audio File</label>
            <input
              type="file"
              accept="audio/*"
              onChange={handleAudioChange}
            />
            {audioFile && (
              <div className="file-info">{audioFile?.title}</div>
            )}
          </div>
          
          <div className="form-group file-upload">
            <label>Update Cover Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
            <div className="image-preview-container">
              {previewImage ? (
                <img src={previewImage} alt="Preview" className="image-preview" />
              ) : currentMusic?.data?.coverImage ? (
                <img 
                  src={formData?.coverImage ? formData.coverImage : `http://localhost:5000/covers/${currentMusic.data.coverImage}`}
                  alt="Current Cover" 
                  className="image-preview"
                />
              ) : (
                <div className="no-image">No image</div>
              )}
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="form-actions">
          <button type="submit" className="save-btn">
            Save Changes
          </button>
          <button 
            type="button" 
            className="cancel-btn"
            onClick={() => navigate('/admin/music/manage-music')}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditMusic;