// features/auth/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import Cookies from 'js-cookie';
import api from '../../../services/api';


const API_URL = import.meta.env.VITE_API_URL;// Your Node.js backend URL

// Async thunk for login
export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/login`, { email, password }, { withCredentials: true });
      return response.data; // Should return { user, token }
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Async thunk for signup
export const registerUser = createAsyncThunk(
  'auth/register',
  async ({ email, password, confirmPassword, displayName, birthDate, gender }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/register`, { email, password, confirmPassword, displayName, birthDate, gender });
      localStorage.setItem('userToken', response.data.token);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const verifyUser = createAsyncThunk(
  'auth/verifyUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(`/frontme`, {
        withCredentials: true
      });

      // If verification succeeds but no user data, force logout or return null
      if (!response.data) {
        return rejectWithValue({ message: 'No user data found' });
      }

      return response.data;
    } catch (error) {
      const status = error?.response?.status;
      const errorData = error?.response?.data;

      if (status === 401) {
        // Optionally, trigger a logout action or redirect here
        return rejectWithValue({
          message: errorData?.message || 'Unauthorized',
          status: 401,
        });
      }

      return rejectWithValue({
        message: errorData || 'Authentication failed',
        status,
      });
    }
  }
);


export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post('/web-refresh-token'); // refresh cookie already sent
      return response.data; // { accessToken }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Session expired');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await api.post(`/userlogout`, {}, { withCredentials: true });
      return true;
    } catch (err) {
      return rejectWithValue('Logout failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState : {
  user: null,
  accessToken: null, // unified token name
  status: 'idle',    // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null
},
  reducers: {
    logout: (state) => {
      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');
      state.user = null;
      state.token = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.accessToken = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Login failed';
      })
      // Register cases
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.accessToken = action.payload.token;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed';
        state.user = null;
        state.accessToken = null;
        state.error = action.payload?.message || 'Registration failed';
      })
      // Verify user cases
      .addCase(verifyUser.pending, (state) => {

        state.status = 'loading';
        state.error = null;
      })
      .addCase(verifyUser.fulfilled, (state, action) => {

        state.status = 'succeeded';
        state.user = action.payload.user;
        state.accessToken = action.payload.token;
      })
      .addCase(verifyUser.rejected, (state, action) => {

        state.status = 'failed';
        state.user = null;
        state.accessToken = null;
        state.error = action.payload?.message || 'Verification failed';
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
              // state.user = null;
              state.accessToken = null;
              state.error = action.payload;
            })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
      })
  }
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;