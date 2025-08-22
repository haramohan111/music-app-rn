import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../../services/api';
import axios from 'axios'
const API_URL = import.meta.env.VITE_SERVER_API_URL;
// Async Thunks
export const fetchAllMusic = createAsyncThunk(
  'music/fetchAllMusic',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/allmusic`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const addToFavorites = createAsyncThunk(
  'music/addFavorite',
  async (trackId, { rejectWithValue, getState }) => {
    try {

      const response = await api.post(`/api/favorites/${trackId}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

// Initial State
const initialState = {
  tracks: [],
  favorites: [],
  currentTrack: null,
  isPlaying: false,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  playlists: [
    { id: 1, name: 'Workout Mix', tracks: [] },
    { id: 2, name: 'Chill Vibes', tracks: [] }
  ]
};

// Slice Creation
const allMusicSlice = createSlice({
  name: 'music',
  initialState,
  reducers: {
    playTrack: (state, action) => {
      state.currentTrack = action.payload;
      state.isPlaying = true;
    },
    pauseTrack: (state) => {
      state.isPlaying = false;
    },
    togglePlay: (state) => {
      state.isPlaying = !state.isPlaying;
    },
    addToPlaylist: (state, action) => {
      const { playlistId, trackId } = action.payload;
      const playlist = state.playlists.find(p => p.id === playlistId);
      if (playlist && !playlist.tracks.includes(trackId)) {
        playlist.tracks.push(trackId);
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch All Music
      .addCase(fetchAllMusic.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAllMusic.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.tracks = action.payload;
      })
      .addCase(fetchAllMusic.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Add to Favorites
      .addCase(addToFavorites.fulfilled, (state, action) => {
        state.favorites.push(action.payload.trackId);
      });
  }
});

// Export Actions
export const { 
  playTrack, 
  pauseTrack, 
  togglePlay, 
  addToPlaylist 
} = allMusicSlice.actions;

// Selectors
export const selectAllTracks = (state) => state.music.tracks;
export const selectCurrentTrack = (state) => state.music.currentTrack;
export const selectIsPlaying = (state) => state.music.isPlaying;
export const selectFavorites = (state) => state.music.favorites;
export const selectPlaylists = (state) => state.music.playlists;

export default allMusicSlice.reducer;