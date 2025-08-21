// features/music/musicSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import api from '../../../services/api'; // Adjust path as needed
const API_URL = import.meta.env.VITE_API_URL;

export const addMusic = createAsyncThunk(
  'music/addMusic',
  async (formData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.post(`/add-music`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add music');
    }
  }
);

export const onlyMusic = createAsyncThunk(
  'music/onlyMusic',
  async (formData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.post(`/add-only-music`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add music');
    }
  }
);

const musicSlice = createSlice({
  name: 'music',
  initialState: {
    loading: false,
    error: null,
    success: false,
    addedMusic: null
  },
  reducers: {
    resetMusicState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
      state.addedMusic = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(addMusic.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(addMusic.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.addedMusic = action.payload;
      })
      .addCase(addMusic.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(onlyMusic.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(onlyMusic.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.addedMusic = action.payload;
      })
      .addCase(onlyMusic.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { resetMusicState } = musicSlice.actions;
export default musicSlice.reducer;