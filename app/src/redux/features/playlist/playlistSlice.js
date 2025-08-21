import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../../services/api';

// Async thunk for creating a new playlist
export const createPlaylist = createAsyncThunk(
  'playlists/createPlaylist',
  async (playlistData, { rejectWithValue }) => {
    try {
      const response = await api.post('/playlists', playlistData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

// Async thunk for fetching user's playlists
export const fetchPlaylists = createAsyncThunk(
  'playlists/fetchPlaylists',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/getall-playlists');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

// Async thunk for fetching popular albums
export const fetchPopularAlbums = createAsyncThunk(
  'playlists/fetchPopularAlbums',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/popularalbum');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const addSongsToPlaylist = createAsyncThunk(
  'playlists/addSongsToPlaylist',
  async ({ musicId, playlistId }, { rejectWithValue }) => {
    console.log('Adding songs to playlist:', { musicId, playlistId });
    try {
      const response = await api.post(
        `/add-songs-to-playlist`,
        { musicId, playlistId },
        { withCredentials: true }
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

// Async thunk for fetching songs in a specific playlist
export const fetchPlaylistSongs = createAsyncThunk(
  'playlists/fetchPlaylistSongs',
  async (playlistId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/get-playlist-songs/${playlistId}`, { withCredentials: true });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const removeSongFromPlaylist = createAsyncThunk(
  'playlists/removeSongFromPlaylist',
  async ({ musicId, playlistId }, { rejectWithValue }) => {
    try {
      const response = await api.delete(
        `/remove-song-from-playlist/${playlistId}/${musicId}`,
        { withCredentials: true }
      );
      return { playlistId, musicId };
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);


const playlistSlice = createSlice({
  name: 'playlists',
  initialState: {
    playlist: [],
    popularAlbums: [],
    playlistSongs: [],
    updatedPlaylist: [],
    perror: null,
    success: false,
    pstatus: 'idle',
    playlistStatus: 'idle',
    cpstatus: 'idle',
    aspstatus: 'idle',
  },
  reducers: {
    resetPlaylistState: (state) => {
      state.perror = null;
      state.success = false;
      state.pstatus = 'idle';
      state.aspstatus = 'idle';
    }
  },
  extraReducers: (builder) => {
    builder
      // Create Playlist Cases
      .addCase(createPlaylist.pending, (state) => {
        state.perror = null;
        state.success = false;
        state.pstatus = 'loading';
      })
      .addCase(createPlaylist.fulfilled, (state, action) => {
        state.success = true;
        state.pstatus = 'succeeded';
        // state.playlist.unshift(action.payload);
      })
      .addCase(createPlaylist.rejected, (state, action) => {
        state.perror = action.payload?.message || 'Failed to create playlist';
        state.pstatus = 'failed';
      })

      // Fetch Playlists Cases
      .addCase(fetchPlaylists.pending, (state) => {
        state.perror = null;
        state.pstatus = 'loading';
      })
      .addCase(fetchPlaylists.fulfilled, (state, action) => {
        state.playlist = action.payload;
        state.pstatus = 'succeeded';
      })
      .addCase(fetchPlaylists.rejected, (state, action) => {
        state.perror = action.payload?.message || 'Failed to fetch playlists';
        state.pstatus = 'failed';
      })

      // Fetch Popular Albums Cases
      .addCase(fetchPopularAlbums.pending, (state) => {
        state.playlistStatus = 'loading';
        state.perror = null;
      })
      .addCase(fetchPopularAlbums.fulfilled, (state, action) => {
        state.playlistStatus = 'succeeded';
        state.popularAlbums = action.payload;
      })
      .addCase(fetchPopularAlbums.rejected, (state, action) => {
        state.playlistStatus = 'failed';
        state.perror = action.payload?.message || 'Failed to fetch popular albums';
      })

      // Add Songs to Playlist
      .addCase(addSongsToPlaylist.pending, (state) => {
        state.perror = null;
        state.aspstatus = 'loading';
      })
      .addCase(addSongsToPlaylist.fulfilled, (state, action) => {
        state.updatedPlaylist = action.payload;
        state.aspstatus = 'succeeded';
      })
      .addCase(addSongsToPlaylist.rejected, (state, action) => {
        console.error('Add songs to playlist error:', action.payload.error);
        state.perror = action.payload?.error || 'Failed to add songs to playlist';
        state.aspstatus = 'failed';
      })

      // Fetch Playlist Songs
      .addCase(fetchPlaylistSongs.pending, (state) => {
        state.playlistStatus = 'loading';
        state.perror = null;
      })
      .addCase(fetchPlaylistSongs.fulfilled, (state, action) => {
        state.playlistSongs = action.payload;
        state.playlistStatus = 'succeeded';
      })
      .addCase(fetchPlaylistSongs.rejected, (state, action) => {
        state.playlistStatus = 'failed';
        state.perror = action.payload?.message || 'Failed to fetch playlist songs';
      })

      // Remove Song from Playlist
      .addCase(removeSongFromPlaylist.pending, (state) => {
        state.perror = null;
        state.pstatus = 'loading';
      })
      .addCase(removeSongFromPlaylist.fulfilled, (state, action) => {
        const { musicId } = action.payload;
        state.playlistSongs.data = state.playlistSongs.data.filter(
          (song) => song.songs.id !== musicId
        );
        state.pstatus = 'succeeded';
      })
      .addCase(removeSongFromPlaylist.rejected, (state, action) => {
        state.perror = action.payload?.message || 'Failed to remove song from playlist';
        state.pstatus = 'failed';
      });
  }
});


export const { resetPlaylistState } = playlistSlice.actions;
export default playlistSlice.reducer;