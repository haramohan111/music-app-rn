import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { verifyUser } from './redux/features/auth/authSlice';

const ProtectedRoute = () => {
  const { admin, status } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();
const dispatch = useDispatch();



  // Auto-verify on idle
  useEffect(() => {
    if (status === 'idle' ) {
      console.log("Dispatching verifyUser action");
      dispatch(verifyUser());
    }
  }, [status, dispatch]);


  useEffect(() => {
    if (status === 'succeeded' && !admin?._id) {
      // Prevent infinite redirect loop
      if (location.pathname !== '/') {
        navigate('/', { replace: true });
      }
    }
  }, [status, admin?._id, navigate, location.pathname]);

  if (status === 'loading') {
    return <p>Loading authentication...</p>;
  }

  if (status === 'failed') {
    return <Navigate to="/" replace />;
  }

  if (status === 'succeeded' && admin?._id) {
    return <Outlet />; // Render protected content
  }

  return null;
};

export default ProtectedRoute;
