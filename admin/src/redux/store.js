// store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import musicReducer from './features/music/musicSlice'; 
import manageMusicReducer from './features/music/ManageMusicSlice'; // Assuming you have a separate slice for managing music

export const store = configureStore({
  reducer: {
    auth: authReducer,
     music: musicReducer,
     manageMusic:manageMusicReducer, // Assuming you have a separate slice for managing music
  },
});

export default store;