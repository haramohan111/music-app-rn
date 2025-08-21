// authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../../services/api'; // Adjust path as needed
const API_URL = import.meta.env.VITE_API_URL;
const initialState = {
  admin: null,
  accessToken: null, // unified token name
  status: 'idle',    // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null
};

// --- LOGIN ---
export const loginAdmin = createAsyncThunk(
  'auth/loginAdmin',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post('/admin/login', credentials); // withCredentials already set in api.js
      return response.data; // should contain { admin, accessToken }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Login failed');
    }
  }
);

// --- VERIFY USER (if token still valid or refreshed) ---
export const verifyUser = createAsyncThunk(
  'auth/verifyUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/me');
      return response.data; // { admin }
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Authentication failed' });
    }
  }
);

// --- REFRESH TOKEN ---
export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post('/admin-refresh-token'); // refresh cookie already sent
      return response.data; // { accessToken }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Session expired');
    }
  }
);

// --- LOGOUT ---
export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      await api.post('/logout');
      return true;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Logout failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.admin = null;
      state.accessToken = null;
      state.status = 'idle';
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // LOGIN
      .addCase(loginAdmin.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.admin = action.payload.admin;
        state.accessToken = action.payload.accessToken;
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // VERIFY
      .addCase(verifyUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(verifyUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.admin = action.payload.admin;
        state.error = null;
      })
      .addCase(verifyUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Authentication failed';
      })

      // REFRESH
      .addCase(refreshToken.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.accessToken = action.payload.accessToken;
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.status = 'failed';
        state.admin = null;
        state.accessToken = null;
        state.error = action.payload;
      })

      // LOGOUT
      .addCase(logoutUser.fulfilled, (state) => {
        state.admin = null;
        state.accessToken = null;
        state.status = 'failed';
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.status = 'idle';
        state.error = action.payload;
      });
  }
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
