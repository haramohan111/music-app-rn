// // components/ProtectedRoute.js
// import React, { useEffect } from 'react';
// import { useSelector } from 'react-redux';
// import { Navigate,Outlet,useLocation ,useNavigate  } from 'react-router-dom';
// import { verifyUser } from '../redux/features/auth/authSlice';

// const ProtectedRoute = ({ children }) => {
//   const { user,status  } = useSelector(state => state.auth);
//   const location = useLocation(); // Get current location
//   const navigate = useNavigate();

// console.log(user,"user");
// console.log(status,"status");


//   // Auto-verify on idle
//   useEffect(() => {
//     if (status === 'idle' ) {
//       console.log("Dispatching verifyUser action");
//       dispatch(verifyUser());
//     }
//   }, [status, dispatch]);

//   useEffect(() => {

//     if (status === 'succeeded' && !user?._id) {

//       navigate('/', { replace: true });
//     }
//   }, [user?.id, navigate]);

//   if (status === 'loading') {

//     return <p>Loading authentication...</p>; 
//   }else if (status === 'failed') {

//     return <Navigate to="/" replace />
//   } else if (status === 'succeeded' && user?._id) {
//     return children ? children : <Outlet />; // Render the protected component
//   }else {
//     return <Navigate to="/" state={{ from: location }} replace />; // Redirect to login page
//   }

// };

// export default ProtectedRoute;



import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { verifyUser } from '../redux/features/auth/authSlice';

const ProtectedRoute = ({children}) => {
  const { user, status } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();



  // Auto-verify on idle
  useEffect(() => {
    if (status === 'idle') {
      console.log("Dispatching verifyUser action");
      dispatch(verifyUser());
    }
  }, [status, dispatch]);


  useEffect(() => {
    if (status === 'succeeded' && !user?._id) {
      // Prevent infinite redirect loop
      if (location.pathname !== '/') {
        navigate('/', { replace: true });
      }
    }
  }, [status, user?._id, navigate, location.pathname]);

  if (status === 'loading') {
    return <p>Loading authentication...</p>;
  }

  if (status === 'failed') {
    return <Navigate to="/" replace />;
  }

  if (status === 'succeeded' && user?._id) {
     return children ? children : <Outlet />; // Render protected content
  }

  return null;
};

export default ProtectedRoute;
