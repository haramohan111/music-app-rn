// hooks/useAuthGuard.js
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Cookies from 'js-cookie';
import { logout } from '../redux/features/auth/authSlice';


export default function useAuthGuard() {
    const dispatch = useDispatch();
    const { user,accessToken } = useSelector(state => state.auth);

    useEffect(() => {
         let hasLoggedOut = false;
        const handleUserActivity = () => {


            if (!user?._id) {
            if (!hasLoggedOut) {
                dispatch(logout());
                hasLoggedOut = true;
            }
            }
        };

        // Listen for user activity
        window.addEventListener('click', handleUserActivity);
        window.addEventListener('scroll', handleUserActivity);
        window.addEventListener('keydown', handleUserActivity);

        return () => {
            window.removeEventListener('click', handleUserActivity);
            window.removeEventListener('scroll', handleUserActivity);
            window.removeEventListener('keydown', handleUserActivity);
        };
    }, [dispatch, user]);
}
