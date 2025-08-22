import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import axios from 'axios';
import * as mm from 'music-metadata'; // ✅ use new package
import { Buffer } from "buffer";
import { addonlyMusicCloudanry } from '../../redux/features/music/musicSlice';

import '../../styles/AddMusic.css';

window.Buffer = Buffer;

// Cloudinary constants
const CLOUD_NAME = 'dccleecro';
const AUDIO_PRESET = 'audio_upload';
const AUDIO_FOLDER = 'music_tracks';
const COVER_PRESET = 'audio_upload';
const COVER_FOLDER = 'music_covers';

const Only = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);

  const [audioFile, setAudioFile] = useState(null);
  const [audioPreview, setAudioPreview] = useState(null);

  const [meta, setMeta] = useState({
    title: '',
    artist: '',
    album: '',
    genre: '',
    year: '',
    track: '',
    durationSeconds: 0,
  });

  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

  const [loading, setLoading] = useState(false);

  // Convert picture from tags to File
  const pictureToFile = (picture) => {
    if (!picture) return null;
    const blob = new Blob([picture.data], { type: picture.format || 'image/jpeg' });
    return new File([blob], 'cover-from-tags.jpg', { type: blob.type });
  };

  // Extract tags with music-metadata
  const extractTags = async (file) => {
    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      const metadata = await mm.parseBuffer(buffer, file.type);

      const common = metadata.common || {};
      const picture = Array.isArray(common.picture) && common.picture.length ? common.picture[0] : null;

      return {
        title: common.title || '',
        artist: common.artist || '',
        album: common.album || '',
        genre: Array.isArray(common.genre) ? common.genre[0] : (common.genre || ''),
        year: common.year ? String(common.year) : '',
        track: common.track?.no ? String(common.track.no) : '',
        durationSeconds: metadata.format.duration ? Math.round(metadata.format.duration) : 0,
        picture,
      };
    } catch (error) {
      console.error("Metadata extraction failed:", error);
      return { title: '', artist: '', album: '', genre: '', year: '', track: '', durationSeconds: 0, picture: null };
    }
  };

  // Upload audio file to Cloudinary
  const uploadAudioToCloudinary = async (file) => {
    const form = new FormData();
    form.append('file', file);
    form.append('folder', AUDIO_FOLDER);
    form.append('upload_preset', AUDIO_PRESET);
    const endpoint = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`;
    const { data } = await axios.post(endpoint, form);
    return {
      url: data.secure_url,
      publicId: data.public_id || '',
      originalName: file?.name || data.original_filename || '',
    };
  };

  // Upload cover image to Cloudinary
  const uploadCoverToCloudinary = async (file) => {
    if (!file) return { url: '', publicId: '', originalName: '' };
    const form = new FormData();
    form.append('file', file);
    form.append('folder', COVER_FOLDER);
    form.append('upload_preset', COVER_PRESET);
    const endpoint = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
    const { data } = await axios.post(endpoint, form);
    return {
      url: data.secure_url,
      publicId: data.public_id || '',
      originalName: file?.name || data.original_filename || '',
    };
  };

  // Handle file selection
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0] || null;
    setAudioFile(file);
    setAudioPreview(file ? URL.createObjectURL(file) : null);

    if (!file) {
      setMeta({ title: '', artist: '', album: '', genre: '', year: '', track: '', durationSeconds: 0 });
      setCoverFile(null);
      setCoverPreview(null);
      return;
    }

    // Extract metadata
    const tags = await extractTags(file);

    const embeddedCoverFile = pictureToFile(tags.picture);
    setCoverFile(embeddedCoverFile);
    setCoverPreview(embeddedCoverFile ? URL.createObjectURL(embeddedCoverFile) : null);

    setMeta({
      title: tags.title || '',
      artist: tags.artist || '',
      album: tags.album || '',
      genre: tags.genre || '',
      year: tags.year || '',
      track: tags.track || '',
      durationSeconds: tags.durationSeconds || 0,
    });
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!audioFile) {
      toast.error('Please select an audio file');
      return;
    }

    try {
      setLoading(true);

      const audioUpload = await uploadAudioToCloudinary(audioFile);
      const coverUpload = await uploadCoverToCloudinary(coverFile);

      const baseTitle = (audioUpload.originalName || '').replace(/\.[^/.]+$/, '');
      const payload = {
        title: meta.title || baseTitle || 'Untitled',
        artist: meta.artist || 'Unknown Artist',
        album: meta.album || '',
        genre: meta.genre || '',
        year: meta.year || '',
        track: meta.track || '',
        durationSeconds: meta.durationSeconds || 0,
        status: 'active',

        audioUrl: audioUpload.url,
        audioPublicId: audioUpload.publicId,
        audioOriginalName: audioUpload.originalName,

        coverUrl: coverUpload.url,
        coverPublicId: coverUpload.publicId,
        coverOriginalName: coverUpload.originalName,
      };

      const res = await dispatch(addonlyMusicCloudanry(payload));
      if (res.meta.requestStatus === 'fulfilled') {
        toast.success('Music uploaded & saved with metadata!');
        setAudioFile(null);
        setAudioPreview(null);
        setCoverFile(null);
        setCoverPreview(null);
        setMeta({ title: '', artist: '', album: '', genre: '', year: '', track: '', durationSeconds: 0 });
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        throw new Error(res.payload || 'Failed to add music');
      }
    } catch (err) {
      console.error(err);
      toast.error('Upload or save failed');
    } finally {
      setLoading(false);
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
              ref={fileInputRef}
            />
            {audioPreview && (
              <audio controls className="audio-preview">
                <source src={audioPreview} type={audioFile?.type} />
                Your browser does not support the audio element.
              </audio>
            )}
          </div>

          {/* Optional preview */}
          {(meta.title || meta.artist || coverPreview) && (
            <div style={{ marginTop: 12 }}>
              <div><b>Title:</b> {meta.title || '—'}</div>
              <div><b>Artist:</b> {meta.artist || '—'}</div>
              <div><b>Album:</b> {meta.album || '—'}</div>
              <div><b>Duration:</b> {meta.durationSeconds ? `${meta.durationSeconds}s` : '—'}</div>
              {coverPreview && (
                <img
                  src={coverPreview}
                  alt="Cover"
                  style={{ width: 80, height: 80, objectFit: 'cover', marginTop: 8, borderRadius: 8 }}
                />
              )}
            </div>
          )}

          <div className="form-actions">
            <button type="submit" disabled={loading} className="submit-btn">
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

export default Only;
