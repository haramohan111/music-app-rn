import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import axios from 'axios';
import { parseBlob } from 'music-metadata-browser';

import '../../styles/AddMusic.css';
import { addonlyMusicCloudanry } from '../../redux/features/music/musicSlice';
import { Buffer } from "buffer";
window.Buffer = Buffer;


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

  // Helpers
  const getDurationFromFile = (file) =>
    new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      const audioEl = document.createElement('audio');
      audioEl.src = url;
      audioEl.addEventListener('loadedmetadata', () => {
        const dur = isFinite(audioEl.duration) ? Math.round(audioEl.duration) : 0;
        URL.revokeObjectURL(url);
        resolve(dur);
      });
      audioEl.addEventListener('error', () => {
        URL.revokeObjectURL(url);
        resolve(0);
      });
    });

  const pictureToFile = (picture) => {
    if (!picture) return null;
    const blob = new Blob([picture.data], { type: picture.format || 'image/jpeg' });
    return new File([blob], 'cover-from-tags.jpg', { type: blob.type });
  };

  //  Use ESM-friendly parser
  const extractTags = async (file) => {
    try {
      const md = await parseBlob(file);
      const common = md.common || {};
      // common.picture is an array; take the first
      const picture = Array.isArray(common.picture) && common.picture.length ? common.picture[0] : null;

      return {
        title: common.title || '',
        artist: common.artist || '',
        album: common.album || '',
        genre: Array.isArray(common.genre) ? common.genre[0] : (common.genre || ''),
        year: common.year ? String(common.year) : '',
        track: common.track && common.track.no ? String(common.track.no) : '',
        picture,
      };
    } catch(error) {
        console.error("extracttags",error)
      return { title: '', artist: '', album: '', genre: '', year: '', track: '', picture: null };
    }
  };


  // Cloudinary uploads
  const uploadAudioToCloudinary = async (file) => {
    const form = new FormData();
    form.append('file', file);
    form.append('folder', AUDIO_FOLDER);
    form.append('upload_preset', AUDIO_PRESET);
    const endpoint = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`; // audio -> video endpoint
    const { data } = await axios.post(endpoint, form);
    return {
      url: data.secure_url,
      publicId: data.public_id || '',
      originalName: file?.name || data.original_filename || '',
    };
  };

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

    const durationSeconds = await getDurationFromFile(file);
    const tags = await extractTags(file);
console.log("tags",tags)
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
      durationSeconds,
    });
  };

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
        // navigate('/admin/music/manage-music');
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

          {/* Optional quick preview of extracted tags */}
          {(meta.title || meta.artist || coverPreview) && (
            <div style={{ marginTop: 12 }}>
              <div><b>Title:</b> {meta.title || '—'}</div>
              <div><b>Artist:</b> {meta.artist || '—'}</div>
              <div><b>Album:</b> {meta.album || '—'}</div>
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
