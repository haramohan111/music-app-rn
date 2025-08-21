// features/auth/authService.js
import store from '../../store';
import { verifyUser } from './authSlice';

export const checkAuth = async () => {
  try {
    await store.dispatch(verifyUser());
    return store.getState().auth.user;
  } catch (error) {
    return null;
  }
};