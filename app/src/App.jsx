// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import ProtectedRoute from './guard/ProtectedRoute';
import './App.css';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { checkAuth } from './redux/features/auth/authService';
import AllMusic from './components/AllMusic-test.jsx';
import Dashboard from './components/Dashboard';
import AllMusics from './components/AllMusics';
import { logoutUser, verifyUser } from './redux/features/auth/authSlice';
import Cookies from 'js-cookie';
import PlayListSongs from './components/PlayListSongs.jsx';
import { ToastContainer } from 'react-toastify';
import useAuthGuard from './guard/useAuthGuard.js';
import Premium from './components/Premium.jsx';
import Support from './components/Support.jsx';
import AboutUs from './components/AboutUs.jsx';
import AllMusicp from './components/AllMusicp.jsx';

function App() {
   useAuthGuard();

  const { user, status, error } = useSelector((state) => state.auth);
  const dispatch = useDispatch();



    useEffect(() => {
      if (status === 'idle') {
      
        dispatch(verifyUser());
      }
    }, [status, dispatch]);

  return (
    <><ToastContainer />
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route element={<Home />} >
            <Route path="/" element={<Dashboard />} />
            <Route path="/d" element={<AllMusic />} />
            <Route path="/allmusic" element={<AllMusics />} />
            <Route path="/s" element={<AllMusic />} />
            <Route path="/premium" element={<Premium/>} />
            <Route path="/support" element={<Support/>} />
            <Route path="/aboutus" element={<AboutUs/>} />
            <Route path="/p" element={<AllMusicp/>} />
            <Route path="/playlistsongs/:id" element={<ProtectedRoute><PlayListSongs /></ProtectedRoute>} />
          </Route>

          {/* Protected Route */}


          {/* Catch-all route redirects to home */}
          <Route path="*" element={<h1 >hi</h1>} />
        </Routes>
      </Router>
    </>
  );
}

export default App;