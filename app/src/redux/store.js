// store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import musicReducer from './features/music/allMusicSlice';
import playlistReducer from './features/playlist/playlistSlice';
import { setStore } from '../redux/storeRef';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    music: musicReducer,
    playlists: playlistReducer,
  },
});

setStore(store); // Assign global reference

export default store;