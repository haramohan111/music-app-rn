// manageMusicSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios'; // or your preferred HTTP client
import api from '../../../services/api'; // Adjust path as needed

// API endpoints (replace with your actual endpoints)
const API_BASE = import.meta.env.VITE_API_URL;
const GET_MUSIC_URL = `${API_BASE}/music-list`;
const DELETE_MUSIC_URL = `${API_BASE}/music-delete`;
const BULK_DELETE_URL = `${API_BASE}/music-bulk-delete`;
const TOGGLE_STATUS_URL = `${API_BASE}/music-toggle-status`; 

// Async thunks for API operations
export const fetchMusic = createAsyncThunk(
  'manageMusic/fetchMusic',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/music-list');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to fetch music');
    }
  }
);

export const deleteMusic = createAsyncThunk(
  'manageMusic/deleteMusic',
  async (musicId, { rejectWithValue }) => {
    try {
      console.log('Deleting music with ID:', musicId);
      await api.delete(`music-delete/${musicId}`);
      return musicId; // Return the ID of the deleted item
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to delete music');
    }
  }
);

export const bulkDeleteMusic = createAsyncThunk(
  'manageMusic/bulkDeleteMusic',
  async (musicIds, { rejectWithValue }) => {
    try {
      await api.post('/music-bulk-delete', { ids: musicIds });
      return musicIds; // Return array of deleted IDs
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to bulk delete music');
    }
  }
);

// Add these to your existing slice
export const fetchMusicById = createAsyncThunk(
  'manageMusic/fetchMusicById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/musicbyid/${id}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to fetch music');
    }
  }
);

export const updateMusic = createAsyncThunk(
  'manageMusic/updateMusic',
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/update-music/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to update music');
    }
  }
);

// Add status toggle thunk
export const toggleMusicStatus = createAsyncThunk(
  'manageMusic/toggleStatus',
  async ({ id, currentStatus }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/music-toggle-status/${id}`, {
        status: currentStatus === 'active' ? 'inactive' : 'active'
      });
      return response.data; // Should return { id, newStatus }
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to toggle status');
    }
  }
);

const initialState = {
  musicData: [], // Data fetched from server
  selectedItems: [], // Client-side selection state
  searchTerm: '', // Client-side filtering
  currentPage: 0, // Pagination
  itemsPerPage: 10, // Pagination
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  lastFetchTime: null
};

const manageMusicSlice = createSlice({
  name: 'manageMusic',
  initialState,
  reducers: {
    // Client-side state management
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
      state.currentPage = 0; // Reset to first page when searching
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    toggleItemSelection: (state, action) => {
      const musicId = action.payload;
      state.selectedItems = state.selectedItems.includes(musicId)
        ? state.selectedItems.filter(id => id !== musicId)
        : [...state.selectedItems, musicId];
    },
    toggleSelectAll: (state) => {
      const currentPageIds = getFilteredMusic(state)
        .slice(
          state.currentPage * state.itemsPerPage,
          (state.currentPage + 1) * state.itemsPerPage
        )
        .map(item => item.id);

      if (state.selectedItems.length === currentPageIds.length) {
        state.selectedItems = [];
      } else {
        state.selectedItems = currentPageIds;
      }
    },
    clearSelection: (state) => {
      state.selectedItems = [];
    },
    // You can add more client-side reducers as needed
  },
  extraReducers: (builder) => {
    builder
      // Fetch music cases
      .addCase(fetchMusic.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchMusic.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.musicData = action.payload;
        state.lastFetchTime = new Date().toISOString();
        state.error = null;
      })
      .addCase(fetchMusic.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Delete music cases
      .addCase(deleteMusic.fulfilled, (state, action) => {
        const deletedId = action.payload;
        state.musicData = state.musicData.filter(item => item.id !== deletedId);
        state.selectedItems = state.selectedItems.filter(id => id !== deletedId);
      })

      // Bulk delete cases
      .addCase(bulkDeleteMusic.fulfilled, (state, action) => {
        const deletedIds = action.payload;
        state.musicData = state.musicData.filter(
          item => !deletedIds.includes(item.id)
        );
        state.selectedItems = [];
      })
      .addCase(fetchMusicById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchMusicById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentMusic = action.payload;
      })
      .addCase(fetchMusicById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(updateMusic.fulfilled, (state, action) => {
        // Update the music in your state if needed
        if (state.manageMusic.musicData) {
          state.manageMusic.musicData = state.manageMusic.musicData.map(item =>
            item.id === action.payload.id ? action.payload : item
          );
        }
      })
      .addCase(toggleMusicStatus.fulfilled, (state, action) => {
        const { id, status } = action.payload;
        const index = state.musicData.findIndex(item => item.id === id);
        if (index !== -1) {
          state.musicData[index].status = status;
        }
      });
  }
});

// Helper function to filter music client-side
const getFilteredMusic = (state) => {
  const { musicData, searchTerm } = state;

  if (!searchTerm) return musicData;

  const searchLower = searchTerm.toLowerCase();
  return musicData.filter(music =>
    music.title.toLowerCase().includes(searchLower) ||
    music.artist.toLowerCase().includes(searchLower) ||
    music.album.toLowerCase().includes(searchLower) ||
    music.genre.toLowerCase().includes(searchLower) ||
    music.id.toString().includes(searchTerm)
  );
};

// Selectors
export const selectAllMusic = (state) => state.manageMusic.musicData;
export const selectFilteredMusic = (state) => getFilteredMusic(state.manageMusic);
export const selectCurrentPageMusic = (state) => {
  const { currentPage, itemsPerPage } = state.manageMusic;
  const filtered = selectFilteredMusic(state);
  const start = currentPage * itemsPerPage;
  return filtered.slice(start, start + itemsPerPage);
};
export const selectPageCount = (state) => {
  const { itemsPerPage } = state.manageMusic;
  const filtered = selectFilteredMusic(state);
  return Math.ceil(filtered.length / itemsPerPage);
};
export const selectMusicStatus = (state) => state.manageMusic.status;
export const selectMusicError = (state) => state.manageMusic.error;
export const selectSelectedItems = (state) => state.manageMusic.selectedItems;
export const selectSearchTerm = (state) => state.manageMusic.searchTerm;
export const selectCurrentPage = (state) => state.manageMusic.currentPage;

// Export actions
export const {
  setSearchTerm,
  setCurrentPage,
  toggleItemSelection,
  toggleSelectAll,
  clearSelection
} = manageMusicSlice.actions;

export default manageMusicSlice.reducer;