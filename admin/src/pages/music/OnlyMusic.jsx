import { useState,useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {  onlyMusic, resetMusicState } from '../../redux/features/music/musicSlice';
import '../../styles/AddMusic.css';
import { toast } from 'react-toastify';

const OnlyMusic = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.music);
  const fileInputRef = useRef(null);

  
  const [audioFile, setAudioFile] = useState(null);
  const [audioPreview, setAudioPreview] = useState(null);
  const [error, setError] = useState(null);

  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setAudioFile(file);
    setError(null); // Reset error when new file is selected
    if (file) {
      setAudioPreview(URL.createObjectURL(file));
    }
  };

  const validateFile = () => {
    if (!audioFile) {
      setError('Audio file is required');
      return false;
    }
    if (!audioFile.type.includes('audio/')) {
      setError('Please upload a valid audio file');
      return false;
    }
    return true;
  };

  const resetForm = () => {
  setAudioFile(null);
  setAudioPreview(null);
  setError(null);

  if (fileInputRef.current) {
    fileInputRef.current.value = '';
  }
};


  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateFile()) return;
    
    const formPayload = new FormData();
    formPayload.append('audioFile', audioFile);

    const result = await dispatch(onlyMusic(formPayload));
    
    if (onlyMusic.fulfilled.match(result)) {
     // navigate('/admin/music/manage-music', { 
    //     state: { success: 'Music uploaded successfully!' } 
    //   });
     // Show success toast
  toast.success('Music uploaded successfully!');
     resetForm();
     
      dispatch(resetMusicState());
    }
  };

  return (
    <div className="add-music-container">
      <div className="card">
        <h2>Upload Music</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group file-upload">
            <label htmlFor="audioFile">Audio File*</label>
            <input
              type="file"
              id="audioFile"
              name="audioFile"
              accept="audio/*"
              onChange={handleFileChange}
              className={error ? 'error' : ''}
              ref={fileInputRef}
            />
            {error && <span className="error-message">{error}</span>}
            {audioPreview && (
              <audio controls className="audio-preview">
                <source src={audioPreview} type={audioFile?.type} />
                Your browser does not support the audio element.
              </audio>
            )}
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              disabled={loading}
              className="submit-btn"
            >
              {loading ? 'Uploading...' : 'Upload Music'}
            </button>
            <button 
              type="button" 
              onClick={() => navigate('/admin/music/manage-music')}
              className="cancel-btn"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OnlyMusic;